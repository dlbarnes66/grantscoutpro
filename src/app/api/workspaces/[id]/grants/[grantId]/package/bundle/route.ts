import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertGrantWorkspaceAccess } from "@/lib/ai/negotiation";
import { generatePackagePdf } from "@/lib/documents/generatePdf";
import { buildFederalFormsInput } from "@/lib/documents/federalFormsInput";
import { resolveChecklist, slugify, type PackageChecklist, type ResolvedChecklistItem } from "@/lib/ai/packageChecklist";
import type { PackageReview } from "@/lib/ai/packageReview";
import { packageActionAllowed, parseSections } from "@/lib/ai/packageContext";
import { zipStream, type ZipEntry } from "@/lib/zip";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

type Params = { id: string; grantId: string };

const MAX_FILE_BYTES = 25 * 1024 * 1024; // matches the upload limit
const MAX_TOTAL_BYTES = 120 * 1024 * 1024;
const encoder = new TextEncoder();
const text = (s: string) => encoder.encode(s);

function safeName(name: string): string {
  return name.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "-").replace(/^\.+/, "").slice(0, 100) || "file";
}
function csvCell(v: unknown): string {
  const s = String(v ?? "");
  // Guard against spreadsheet formula injection as well as quoting.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}
const csv = (rows: unknown[][]) => rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";

// Only fetch files that live in our own Vercel Blob store. WorkspaceFile.url
// is recorded from a client request, so it must never be fetched blindly.
function isBlobUrl(u: string): boolean {
  try {
    const url = new URL(u);
    return url.protocol === "https:" && url.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

function checklistText(items: ResolvedChecklistItem[], meta: PackageChecklist | null): string {
  if (!meta) return "No checklist was built for this package.\r\n";
  const lines = [`APPLICATION CHECKLIST`, ``];
  if (meta.deadline) lines.push(`Deadline: ${meta.deadline.slice(0, 10)}`);
  if (meta.submissionMethod) lines.push(`Submission method (from listing, verify): ${meta.submissionMethod}`);
  if (meta.notes) lines.push(`Notes (from listing, verify): ${meta.notes}`);
  lines.push(``);
  for (const cat of ["registration", "eligibility", "form", "narrative", "budget", "attachment", "submission"]) {
    const group = items.filter((i) => i.category === cat);
    if (group.length === 0) continue;
    lines.push(cat.toUpperCase());
    for (const i of group) {
      lines.push(
        `  [${i.complete ? "x" : " "}] ${i.label}${i.required ? "" : " (optional)"}${i.source === "funder-text" ? " (from listing, verify)" : ""}`
      );
    }
    lines.push(``);
  }
  return lines.join("\r\n");
}

function reviewText(review: PackageReview | null): string {
  if (!review) return "The compliance review has not been run for this package.\r\n";
  const lines = [
    `COMPLIANCE AND CONSISTENCY REVIEW (run ${review.ranAt.slice(0, 16).replace("T", " ")} UTC)`,
    `Blockers: ${review.counts.blocker}   Warnings: ${review.counts.warning}   Notes: ${review.counts.info}`,
    `AI consistency check: ${review.aiRan ? "ran" : "did not run"}`,
    ``,
  ];
  for (const f of review.findings) {
    lines.push(`[${f.severity.toUpperCase()}] (${f.area}) ${f.message}`);
    if (f.fix) lines.push(`    Fix: ${f.fix}`);
  }
  return lines.join("\r\n") + "\r\n";
}

export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = await context.params;
  if (!(await assertGrantWorkspaceAccess(params.id, params.grantId, userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await packageActionAllowed("bundle", userId))) {
    return NextResponse.json({ error: "Too many downloads this hour. Please try again later." }, { status: 429 });
  }

  const grant = await prisma.grant.findUnique({ where: { id: params.grantId } });
  if (!grant) return NextResponse.json({ error: "Grant not found" }, { status: 404 });
  const application = await prisma.application.findFirst({ where: { workspaceId: params.id, grantId: params.grantId } });
  if (!application) return NextResponse.json({ error: "No package generated yet." }, { status: 404 });

  const sections = parseSections(application.content);
  const budget = (application.budget as any) || null;
  const storedChecklist = (application.checklist as unknown as PackageChecklist) || null;
  const items = storedChecklist ? resolveChecklist(storedChecklist, sections, budget) : [];
  const review = (application.review as unknown as PackageReview) || null;

  const fileIds = Array.from(new Set(items.flatMap((i) => i.fileIds)));
  const files = fileIds.length
    ? await prisma.workspaceFile.findMany({ where: { workspaceId: params.id, id: { in: fileIds } } })
    : [];
  const fileById = new Map(files.map((f) => [f.id, f]));

  let pdfBytes: Uint8Array;
  try {
    const federalForms = await buildFederalFormsInput(params.id, grant, application);
    pdfBytes = await generatePackagePdf(grant.title, sections, budget, federalForms);
  } catch (err) {
    console.error("BUNDLE PDF ERROR:", err);
    return NextResponse.json({ error: "Failed to build the application PDF." }, { status: 500 });
  }

  const slug = slugify(grant.title) || "submission-package";
  const problems: string[] = [];

  async function* entries(): AsyncGenerator<ZipEntry> {
    yield { name: "1-Application/application-package.pdf", data: pdfBytes };
    yield {
      name: "1-Application/narrative-sections.txt",
      data: text(sections.map((s) => `${s.title.toUpperCase()}\r\n\r\n${s.content}\r\n`).join("\r\n----------------------------------------\r\n\r\n")),
    };

    if (budget?.lineItems?.length) {
      yield {
        name: "2-Budget/budget-line-items.csv",
        data: text(
          csv([
            ["Category", "Description", "Amount", "Justification"],
            ...budget.lineItems.map((i: any) => [i.category, i.description, i.amount, i.justification || ""]),
            ["TOTAL", "", budget.total, ""],
          ])
        ),
      };
      const extra: unknown[][] = [];
      if (budget.match) extra.push(["Match", budget.match.required ? "required" : "not required", budget.match.amount || 0, budget.match.notes || ""]);
      for (const f of budget.otherFunding || []) extra.push(["Other funding", f.source, f.amount, f.status]);
      if (extra.length) yield { name: "2-Budget/matching-and-other-funding.csv", data: text(csv([["Type", "Source", "Amount", "Status / notes"], ...extra])) };
      if (budget.cashFlow?.length) {
        yield {
          name: "2-Budget/cash-flow-plan.csv",
          data: text(csv([["Period", "Expected receipts", "Spending", "Notes"], ...budget.cashFlow.map((c: any) => [c.period, c.inflow, c.outflow, c.notes || ""])])),
        };
      }
    }

    yield { name: "3-Checklist/application-checklist.txt", data: text(checklistText(items, storedChecklist)) };
    yield { name: "4-Review/compliance-review.txt", data: text(reviewText(review)) };

    let total = 0;
    let n = 0;
    for (const item of items) {
      if (item.fileIds.length === 0) continue;
      n++;
      const folder = `5-Supporting-Documents/${String(n).padStart(2, "0")}-${safeName(slugify(item.label) || "attachment")}`;
      for (const id of item.fileIds) {
        const f = fileById.get(id);
        if (!f) continue;
        if (!isBlobUrl(f.url)) {
          problems.push(`${f.filename}: stored in an unsupported location, not included.`);
          continue;
        }
        try {
          const res = await fetch(f.url, { signal: AbortSignal.timeout(20_000) });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = new Uint8Array(await res.arrayBuffer());
          if (data.length > MAX_FILE_BYTES || total + data.length > MAX_TOTAL_BYTES) {
            problems.push(`${f.filename}: too large to include in the bundle, attach it separately.`);
            continue;
          }
          total += data.length;
          yield { name: `${folder}/${safeName(f.filename)}`, data };
        } catch (err: any) {
          problems.push(`${f.filename}: could not be downloaded (${err?.message || "error"}).`);
        }
      }
    }

    const missing = items.filter((i) => i.required && !i.complete);
    const readme = [
      `SUBMISSION BUNDLE: ${grant.title}`,
      `Funder: ${grant.agency || "not specified"}`,
      `Built: ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC from Grant Scout Pro`,
      `Package status: ${application.status === "ready" ? "marked ready" : "DRAFT (not marked ready)"}`,
      ``,
      `Grant Scout Pro does not submit applications. Upload these files through the funder's own portal or Grants.gov.`,
      ``,
      `CONTENTS`,
      `  1-Application      application PDF (narrative, budget${grant.source === "FEDERAL" ? ", SF-424/424A/424B" : ""}) and the narrative as plain text for pasting into portals`,
      `  2-Budget           line items with justifications, matching funds, cash-flow plan (open in Excel)`,
      `  3-Checklist        what the funder requires and what is done`,
      `  4-Review           latest compliance and consistency review`,
      `  5-Supporting-Documents   the files you attached to checklist items, one folder per item`,
      ``,
      missing.length ? `STILL MISSING (${missing.length} required items):` : `All required checklist items are complete.`,
      ...missing.map((m) => `  - ${m.label}`),
      ...(review ? [``, `Review: ${review.counts.blocker} blockers, ${review.counts.warning} warnings.`] : [``, `The compliance review has not been run.`]),
      ...(problems.length ? [``, `FILES NOT INCLUDED:`, ...problems.map((p) => `  - ${p}`)] : []),
      ``,
      `Budget total: ${budget ? money(budget.total || 0) : "n/a"}`,
    ].join("\r\n");
    yield { name: "README.txt", data: text(readme + "\r\n") };
  }

  return new Response(zipStream(entries()), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}-submission-bundle.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
