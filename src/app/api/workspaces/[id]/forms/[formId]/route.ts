import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string; formId: string };

const ALLOWED_FIELD_TYPES = ["text", "textarea", "email", "phone", "number", "date", "select", "checkbox"];
const ALLOWED_STATUSES = ["draft", "published", "closed"];

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

// GET: one form plus its responses.
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

    const form = await prisma.workspaceForm.findFirst({
      where: { id: params.formId, workspaceId: params.id },
      include: {
        responses: { orderBy: { submittedAt: "desc" }, take: 200 },
        grant: { select: { id: true, title: true } },
      },
    });

    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    return NextResponse.json({ success: true, form });
  } catch (err: any) {
    console.error("WORKSPACE FORM GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH { title?, description?, fields?, status? } -> update a form.
export async function PATCH(
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

    const existing = await prisma.workspaceForm.findFirst({
      where: { id: params.formId, workspaceId: params.id },
    });
    if (!existing) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    const body = await req.json().catch(() => null);
    const data: Record<string, any> = {};

    if (body?.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json({ error: "title cannot be empty." }, { status: 400 });
      }
      data.title = body.title.trim();
    }

    if (body?.description !== undefined) {
      data.description = typeof body.description === "string" ? body.description : null;
    }

    if (body?.fields !== undefined) {
      const fieldError = validateFields(body.fields);
      if (fieldError) return NextResponse.json({ error: fieldError }, { status: 400 });
      data.fields = body.fields;
    }

    if (body?.status !== undefined) {
      if (!ALLOWED_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: `status must be one of: ${ALLOWED_STATUSES.join(", ")}` }, { status: 400 });
      }
      data.status = body.status;
    }

    const updated = await prisma.workspaceForm.update({
      where: { id: params.formId },
      data,
    });

    return NextResponse.json({ success: true, form: updated });
  } catch (err: any) {
    console.error("WORKSPACE FORM PATCH ERROR:", err);
    return NextResponse.json({ error: err.message || "Failed to update form." }, { status: 500 });
  }
}

// DELETE -> remove a form and its responses.
export async function DELETE(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspace, isMember } = await requireMember(params.id, userId);
    if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const existing = await prisma.workspaceForm.findFirst({
      where: { id: params.formId, workspaceId: params.id },
    });
    if (!existing) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    await prisma.workspaceForm.delete({ where: { id: params.formId } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("WORKSPACE FORM DELETE ERROR:", err);
    return NextResponse.json({ error: err.message || "Failed to delete form." }, { status: 500 });
  }
}
