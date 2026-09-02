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

  const { commentId } = await req.json().catch(() => ({}));
  if (!commentId) {
    return NextResponse.json({ error: "Missing commentId" }, { status: 400 });
  }

  try {
    const comment = await prisma.documentComment.findUnique({
      where: { id: commentId },
      include: {
        document: {
          include: {
            workspace: { include: { members: true } },
          },
        },
      },
    });

    if (!comment || comment.documentId !== params.documentId) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const workspace = comment.document.workspace;

    const isOwner = workspace.ownerId === userId;
    const isAdmin = workspace.members.some((m) => m.userId === userId && m.role === "admin");
    const isAuthor = comment.userId === userId;

    if (!isOwner && !isAdmin && !isAuthor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.documentComment.delete({
      where: { id: commentId },
    });

    await prisma.workspaceActivity.create({
      data: {
        workspaceId: params.id,
        userId,
        action: "comment-delete",
        metadata: { documentId: params.documentId, commentId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("COMMENTS DELETE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
