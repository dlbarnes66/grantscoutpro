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
  if (!body || !body.text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  try {
    const document = await prisma.workspaceDocument.findUnique({
      where: { id: params.documentId },
      include: {
        workspace: { include: { members: true } },
      },
    });

    if (!document || document.workspaceId !== params.id) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const workspace = document.workspace;

    const isMember =
      workspace.ownerId === userId ||
      workspace.members.some((m) => m.userId === userId);

    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const comment = await prisma.documentComment.create({
      data: {
        documentId: params.documentId,
        userId,
        text: body.text,
        parentId: body.parentId ?? null,
        position: body.position ?? null,
      },
    });

    await prisma.workspaceActivity.create({
      data: {
        workspaceId: params.id,
        userId,
        action: "comment-create",
        metadata: { documentId: params.documentId, commentId: comment.id },
      },
    });

    return NextResponse.json({ success: true, comment });
  } catch (err: any) {
    console.error("COMMENTS CREATE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
