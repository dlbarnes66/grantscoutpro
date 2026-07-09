import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";
import { sendNotification } from "@/lib/notifications/sendNotification";
import { logActivity } from "@/lib/ai/activity-log";

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    // ⭐ Admin‑only enforcement
    await requireWorkspaceRole(params.workspaceId, ["admin"]);

    const { email } = await req.json();

    // ⭐ Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { email },
      });
    }

    // ⭐ Create workspace member
    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId: params.workspaceId,
        userId: user.id,
        role: "member",
      },
      include: { user: true },
    });

    // ⭐ Log activity
    await logActivity(params.workspaceId, "member_invited", {
      email,
      userId: user.id,
      memberId: member.id,
    });

    // ⭐ Send notification
    await sendNotification(
      params.workspaceId,
      "member_invited",
      `Invited ${email} to the workspace`,
      {
        userId: user.id,
        memberId: member.id,
      }
    );

    return NextResponse.json({ member });
  } catch (error: any) {
    console.error("Invite error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
