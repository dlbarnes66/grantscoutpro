import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

const ALLOWED_FIELD_TYPES = ["text", "textarea", "email", "phone", "number", "date", "select", "checkbox"];

async function requireMember(workspaceId: string, userId: string | null | undefined) {
  if (!userId) return { workspace: null, isMember: false };
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { members: true },
  });
  if (!workspace) return { workspace: null, isMember: false };
  const isMember = workspace.ownerId === userId || workspace.members.some((m) => m.userId === userId);
  return { workspace, isMember };
}

function validateFields(fields: any): string | null {
  if (!Array.isArray(fields) || fields.length === 0) return "At least one field is required.";
  const seen = new Set<string>();
  for (const f of fields) {
    if (!f || typeof f.id !== "string" || !f.id.trim()) return "Every field needs an id.";
    if (seen.has(f.id)) return `Duplicate field id "${f.id}".`;
    seen.add(f.id);
    if (typeof f.label !== "string" || !f.label.trim()) return `Field "${f.id}" needs a label.`;
    if (!ALLOWED_FIELD_TYPES.includes(f.type)) return `Field "${f.id}" has an unsupported type.`;
  }
  return null;
}

async function generateShareSlug(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const slug = crypto.randomBytes(9).toString("base64url");
    const existing = await prisma.workspaceForm.findUnique({ where: { shareSlug: slug } });
    if (!existing) return slug;
  }
  throw new Error("Could not generate a unique share link. Try again.");
}

// GET: list this workspace's forms.
export async function GET(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();

  try {
    const { workspace, isMember } = await requireMember(params.id, userId);
    if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const forms = await prisma.workspaceForm.findMany({
      where: { workspaceId: params.id },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { responses: true } }, grant: { select: { title: true } } },
    });

    return NextResponse.json({
      success: true,
      forms: forms.map((f) => ({
        id: f.id,
        title: f.title,
        description: f.description,
        status: f.status,
        shareSlug: f.shareSlug,
        grantTitle: f.grant?.title || null,
        responseCount: f._count.responses,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      })),
    });
  } catch (err: any) {
    console.error("WORKSPACE FORMS GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST { title, description?, fields, grantId? } -> save a new form (draft).
export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspace, isMember } = await requireMember(params.id, userId);
    if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    if (!title) return NextResponse.json({ error: "title is required." }, { status: 400 });

    const fieldError = validateFields(body?.fields);
    if (fieldError) return NextResponse.json({ error: fieldError }, { status: 400 });

    let grantId: string | null = null;
    if (typeof body?.grantId === "string" && body.grantId) {
      const grant = await prisma.grant.findFirst({
        where: { id: body.grantId, workspaceId: params.id },
        select: { id: true },
      });
      grantId = grant?.id || null;
    }

    const shareSlug = await generateShareSlug();

    const form = await prisma.workspaceForm.create({
      data: {
        workspaceId: params.id,
        title,
        description: typeof body?.description === "string" ? body.description : null,
        fields: body.fields,
        grantId,
        shareSlug,
        createdById: userId,
        status: "draft",
      },
    });

    return NextResponse.json({ success: true, form });
  } catch (err: any) {
    console.error("WORKSPACE FORMS POST ERROR:", err);
    return NextResponse.json({ error: err.message || "Failed to save form." }, { status: 500 });
  }
}
