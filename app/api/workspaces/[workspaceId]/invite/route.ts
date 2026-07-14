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
    await requireWorkspaceRole(params.workspaceId, ["ADMIN"]);

    const { email } = await req.json();

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { email },
      });
    }

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId: params.workspaceId,
        userId: user.id,
        role: "MEMBER",
      },
      include: { user: true },
    });

    await logActivity(params.workspaceId, "member_invited", {
      email,
      userId: user.id,
      memberId: member.id,
    });

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
