import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { id: string; documentId: string };

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetUserId } = await req.json().catch(() => ({}));
  if (!targetUserId)
    return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 });

  const doc = await prisma.workspaceDocument.findUnique({
    where: { id: params.documentId },
    include: {
      workspace: { include: { members: true } },
    },
  });

  if (!doc || doc.workspaceId !== params.id)
    return NextResponse.json({ error: "Document not found" }, { status: 404 });

  const workspace = doc.workspace;

  const isOwner = workspace.ownerId === userId;
  const isAdmin = workspace.members.some((m) => m.userId === userId && m.role === "admin");

  if (!isOwner && !isAdmin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.documentShare.deleteMany({
    where: {
      documentId: params.documentId,
      userId: targetUserId,
    },
  });

  return NextResponse.json({ success: true });
}
