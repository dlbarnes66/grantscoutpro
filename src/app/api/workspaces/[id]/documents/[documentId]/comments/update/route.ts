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
  if (!body || !body.commentId || !body.text) {
    return NextResponse.json({ error: "Missing commentId or text" }, { status: 400 });
  }

  try {
    const comment = await prisma.documentComment.findUnique({
      where: { id: body.commentId },
    });

    if (!comment || comment.documentId !== params.documentId) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.documentComment.update({
      where: { id: body.commentId },
      data: { text: body.text },
    });

    await prisma.workspaceActivity.create({
      data: {
        workspaceId: params.id,
        userId,
        action: "comment-update",
        metadata: { documentId: params.documentId, commentId: body.commentId },
      },
    });

    return NextResponse.json({ success: true, comment: updated });
  } catch (err: any) {
    console.error("COMMENTS UPDATE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
