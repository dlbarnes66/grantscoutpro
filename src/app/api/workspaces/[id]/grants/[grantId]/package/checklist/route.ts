import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertGrantWorkspaceAccess } from "@/lib/ai/negotiation";
import {
  generatePackageChecklist,
  resolveChecklist,
  slugify,
  type ChecklistCategory,
  type ChecklistItem,
  type PackageChecklist,
} from "@/lib/ai/packageChecklist";
import { packageActionAllowed, parseSections } from "@/lib/ai/packageContext";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

type Params = { id: string; grantId: string };

async function view(workspaceId: string, checklist: PackageChecklist, application: { content: string | null; budget: unknown }) {
  const files = await prisma.workspaceFile.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    select: { id: true, filename: true, mimeType: true, size: true, url: true, createdAt: true },
  });
  return {
    checklist: {
      ...checklist,
      items: resolveChecklist(checklist, parseSections(application.content), application.budget as any),
    },
    files,
  };
}

export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = await context.params;
  if (!(await assertGrantWorkspaceAccess(params.id, params.grantId, userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const application = await prisma.application.findFirst({ where: { workspaceId: params.id, grantId: params.grantId } });
  if (!application?.checklist) return NextResponse.json({ checklist: null, files: [] });
  return NextResponse.json(await view(params.id, application.checklist as unknown as PackageChecklist, application));
}

// POST - build (or rebuild) the grant-specific checklist. Rebuilding keeps
// the user's ticks, attached files and custom items.
export async function POST(_req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = await context.params;
  if (!(await assertGrantWorkspaceAccess(params.id, params.grantId, userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await packageActionAllowed("checklist", userId))) {
    return NextResponse.json({ error: "Too many checklist builds this hour. Please try again later." }, { status: 429 });
  }

  const application = await prisma.application.findFirst({ where: { workspaceId: params.id, grantId: params.grantId } });
  if (!application) return NextResponse.json({ error: "Generate the submission package first." }, { status: 404 });

  const grant = await prisma.grant.findUnique({ where: { id: params.grantId } });
  if (!grant) return NextResponse.json({ error: "Grant not found" }, { status: 404 });

  const checklist = await generatePackageChecklist(grant, (application.checklist as unknown as PackageChecklist) || null);
  const saved = await prisma.application.update({
    where: { id: application.id },
    data: { checklist: checklist as any },
  });
  return NextResponse.json(await view(params.id, checklist, saved));
}

const CATEGORIES: ChecklistCategory[] = ["registration", "eligibility", "form", "narrative", "budget", "attachment", "submission"];

// PUT - save progress: ticks, attached files, and the user's own custom
// items. Built-in and funder items can't be renamed or removed here.
export async function PUT(req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = await context.params;
  if (!(await assertGrantWorkspaceAccess(params.id, params.grantId, userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const application = await prisma.application.findFirst({ where: { workspaceId: params.id, grantId: params.grantId } });
  const stored = application?.checklist as unknown as PackageChecklist | null;
  if (!application || !stored) return NextResponse.json({ error: "Build the checklist first." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const submitted: any[] = Array.isArray(body.items) ? body.items.slice(0, 200) : [];

  // Only files that belong to this workspace can be attached.
  const workspaceFiles = await prisma.workspaceFile.findMany({ where: { workspaceId: params.id }, select: { id: true } });
  const validFileIds = new Set(workspaceFiles.map((f) => f.id));
  const cleanFileIds = (v: unknown): string[] =>
    Array.isArray(v) ? Array.from(new Set(v.filter((x) => typeof x === "string" && validFileIds.has(x)))).slice(0, 20) : [];

  const byId = new Map(submitted.filter((s) => s && typeof s.id === "string").map((s) => [s.id as string, s]));

  const items: ChecklistItem[] = [];
  for (const existing of stored.items) {
    if (existing.source === "custom" && !byId.has(existing.id)) continue; // custom item removed
    const s = byId.get(existing.id);
    items.push(
      s
        ? { ...existing, done: s.done === true, fileIds: cleanFileIds(s.fileIds) }
        : existing
    );
  }
  const existingIds = new Set(stored.items.map((i) => i.id));
  for (const s of submitted) {
    if (!s || existingIds.has(s.id) || s.source !== "custom" || typeof s.label !== "string" || !s.label.trim()) continue;
    const label = s.label.trim().slice(0, 140);
    items.push({
      id: `cust:${slugify(label)}-${Math.random().toString(36).slice(2, 7)}`,
      label,
      category: CATEGORIES.includes(s.category) ? s.category : "attachment",
      required: s.required === true,
      source: "custom",
      detail: typeof s.detail === "string" ? s.detail.trim().slice(0, 300) : undefined,
      done: s.done === true,
      fileIds: cleanFileIds(s.fileIds),
    });
  }

  const checklist: PackageChecklist = { ...stored, items };
  const saved = await prisma.application.update({ where: { id: application.id }, data: { checklist: checklist as any } });
  return NextResponse.json(await view(params.id, checklist, saved));
}
