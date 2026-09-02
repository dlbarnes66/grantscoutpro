import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: { members: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const isOwner = workspace.ownerId === userId;
    const isAdmin = workspace.members.some((m) => m.userId === userId && m.role === "admin");

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.title || !body.message || !body.type) {
      return NextResponse.json(
        { error: "Missing title, message, or type" },
        { status: 400 }
      );
    }

    const recipients = [workspace.ownerId, ...workspace.members.map((m) => m.userId)];

    const created = await prisma.workspaceNotification.createMany({
      data: recipients.map((recipientId) => ({
        workspaceId: params.id,
        userId: recipientId,
        type: body.type,       // REQUIRED FIELD
        title: body.title,
        message: body.message,
        read: false,
      })),
    });

    return NextResponse.json({ success: true, created });
  } catch (err: any) {
    console.error("WORKSPACE NOTIFICATIONS CREATE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
