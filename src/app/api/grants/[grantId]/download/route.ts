import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceMember } from "@/lib/auth";
import { generateGrantSummaryPdf } from "@/lib/documents/generatePdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { grantId: string };

function slugifyFilename(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug || "grant"}.pdf`;
}

// Downloadable one-page reference PDF for a single grant - lets a client
// save a grant to their own computer instead of only viewing it in-app.
// Same workspaceId-from-query-string + membership pattern as
// src/app/api/grants/[grantId]/detail/route.ts.
export async function GET(req: Request, context: { params: Promise<Params> }) {
  try {
    await requireUser();
    const { grantId } = await context.params;

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId") || "";

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    await requireWorkspaceMember(workspaceId);

    const grant = await prisma.grant.findUnique({ where: { id: grantId } });

    if (!grant || grant.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Grant not found." }, { status: 404 });
    }

    const pdfBytes = await generateGrantSummaryPdf({
      title: grant.title,
      agency: grant.agency,
      category: grant.category,
      status: grant.status,
      summary: grant.summary,
      aiSummary: grant.aiSummary,
      awardFloor: grant.awardFloor ?? grant.amountMin,
      awardCeiling: grant.awardCeiling ?? grant.amountMax,
      deadline: grant.deadline,
      openDate: grant.openDate,
      eligibleApplicants: grant.eligibleApplicants,
      url: grant.url,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slugifyFilename(grant.title)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    const message = err?.message || "Failed to generate PDF.";
    const status = message.startsWith("Unauthorized") ? 401 : message.includes("access") ? 403 : 500;
    if (status === 500) console.error("GRANT DOWNLOAD PDF ERROR:", err);
    return NextResponse.json({ error: message }, { status });
  }
}
