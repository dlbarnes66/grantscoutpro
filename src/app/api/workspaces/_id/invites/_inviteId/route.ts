import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string; inviteId: string };

export async function POST(
  _req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const invite = await prisma.workspaceInvite.findUnique({
      where: { id: params.inviteId },
    });

    if (!invite || invite.workspaceId !== params.id) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    await prisma.workspaceMember.create({
      data: {
        workspaceId: params.id,
        userId,
        role: "member",
      },
    });

    await prisma.workspaceInvite.update({
      where: { id: params.inviteId },
      data: { status: "accepted" },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("WORKSPACE INVITE ACCEPT ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (workspace.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.workspaceInvite.update({
      where: { id: params.inviteId },
      data: { status: "revoked" },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("WORKSPACE INVITE REVOKE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
