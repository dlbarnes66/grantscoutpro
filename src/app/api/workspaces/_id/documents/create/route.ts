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

  const body = await req.json().catch(() => null);
  if (!body || !body.title) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 });
  }

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: { members: true },
    });

    if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

    const isOwner = workspace.ownerId === userId;
    const isAdmin = workspace.members.some((m) => m.userId === userId && m.role === "admin");

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const doc = await prisma.workspaceDocument.create({
      data: {
        workspaceId: params.id,
        title: body.title,
        content: body.content ?? "",
      },
    });

    await prisma.workspaceActivity.create({
      data: {
        workspaceId: params.id,
        userId,
        action: "document-create",
        metadata: { documentId: doc.id },
      },
    });

    return NextResponse.json({ success: true, document: doc });
  } catch (err: any) {
    console.error("DOCUMENT CREATE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
