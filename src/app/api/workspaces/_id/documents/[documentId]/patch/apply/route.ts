import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { id: string; documentId: string };

export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { patchId } = await req.json().catch(() => ({}));
  if (!patchId) {
    return NextResponse.json({ error: "Missing patchId" }, { status: 400 });
  }

  try {
    const patch = await prisma.documentPatch.findUnique({
      where: { id: patchId },
      include: {
        document: {
          include: {
            workspace: { include: { members: true } },
          },
        },
      },
    });

    if (!patch || patch.docId !== params.documentId) {
      return NextResponse.json({ error: "Patch not found" }, { status: 404 });
    }

    const workspace = patch.document.workspace;

    const isOwner = workspace.ownerId === userId;
    const isAdmin = workspace.members.some((m) => m.userId === userId && m.role === "admin");

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const doc = await prisma.workspaceDocument.findUnique({
      where: { id: params.documentId },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const original = doc.content ?? "";
    const patchOps = patch.patch as any[];

    let updated = original;

    for (const op of patchOps) {
      if (op.op === "replace") {
        const idx = op.path;
        updated = updated.substring(0, idx) + op.value + updated.substring(idx + op.value.length);
      }
      if (op.op === "insert") {
        const idx = op.path;
        updated = updated.substring(0, idx) + op.value + updated.substring(idx);
      }
      if (op.op === "delete") {
        const { start, end } = op;
        updated = updated.substring(0, start) + updated.substring(end);
      }
    }

    const saved = await prisma.workspaceDocument.update({
      where: { id: params.documentId },
      data: { content: updated },
    });

    await prisma.workspaceActivity.create({
      data: {
        workspaceId: params.id,
        userId,
        action: "document-patch-apply",
        metadata: { documentId: params.documentId, patchId },
      },
    });

    return NextResponse.json({ success: true, document: saved });
  } catch (err: any) {
    console.error("PATCH APPLY ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
