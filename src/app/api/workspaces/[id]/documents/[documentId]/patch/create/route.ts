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

  const body = await req.json().catch(() => null);
  if (!body || !body.patch) {
    return NextResponse.json({ error: "Missing patch" }, { status: 400 });
  }

  try {
    const doc = await prisma.workspaceDocument.findUnique({
      where: { id: params.documentId },
      include: {
        workspace: { include: { members: true } },
      },
    });

    if (!doc || doc.workspaceId !== params.id) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const workspace = doc.workspace;

    const isMember =
      workspace.ownerId === userId ||
      workspace.members.some((m) => m.userId === userId);

    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const patch = await prisma.documentPatch.create({
      data: {
        docId: params.documentId,
        userId,
        patch: body.patch,
      },
    });

    await prisma.workspaceActivity.create({
      data: {
        workspaceId: params.id,
        userId,
        action: "document-patch-create",
        metadata: { documentId: params.documentId, patchId: patch.id },
      },
    });

    return NextResponse.json({ success: true, patch });
  } catch (err: any) {
    console.error("PATCH CREATE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
