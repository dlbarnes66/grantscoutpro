import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { documentId } = await req.json().catch(() => ({}));
  if (!documentId) {
    return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
  }

  try {
    const doc = await prisma.workspaceDocument.findUnique({
      where: { id: documentId },
      include: {
        workspace: { include: { members: true } },
      },
    });

    if (!doc || doc.workspaceId !== params.id) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const workspace = doc.workspace;

    const isOwner = workspace.ownerId === userId;
    const isAdmin = workspace.members.some((m) => m.userId === userId && m.role === "admin");

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.workspaceDocument.delete({
      where: { id: documentId },
    });

    await prisma.workspaceActivity.create({
      data: {
        workspaceId: params.id,
        userId,
        action: "document-delete",
        metadata: { documentId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DOCUMENT DELETE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
