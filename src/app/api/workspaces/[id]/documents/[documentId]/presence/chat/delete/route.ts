import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { id: string; documentId: string };

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId } = await req.json().catch(() => ({}));
  if (!messageId)
    return NextResponse.json({ error: "Missing messageId" }, { status: 400 });

  const message = await prisma.comment.findUnique({
    where: { id: messageId },
  });

  if (!message || message.workspaceId !== params.id)
    return NextResponse.json({ error: "Message not found" }, { status: 404 });

  const workspace = await prisma.workspace.findUnique({
    where: { id: params.id },
    include: { members: true },
  });

  if (!workspace)
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const isOwner = workspace.ownerId === userId;
  const isAdmin = workspace.members.some((m) => m.userId === userId && m.role === "admin");
  const isAuthor = message.userId === userId;

  if (!isOwner && !isAdmin && !isAuthor)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.comment.delete({
    where: { id: messageId },
  });

  return NextResponse.json({ success: true });
}
