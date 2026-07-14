import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";
import { sendNotification } from "@/lib/notifications/sendNotification";
import { logActivity } from "@/lib/ai/activity-log";

export async function DELETE(
  req: Request,
  { params }: { params: { workspaceId: string; memberId: string } }
) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN"]);

    const member = await prisma.workspaceMember.findUnique({
      where: { id: params.memberId },
      include: { user: true },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    await prisma.workspaceMember.delete({
      where: { id: params.memberId },
    });

    await logActivity(params.workspaceId, "member_removed", {
      memberId: params.memberId,
      userId: member.userId,
      email: member.user?.email || null,
    });

    await sendNotification(
      params.workspaceId,
      "member_removed",
      `Removed ${member.user?.email || "a workspace member"}`,
      {
        memberId: params.memberId,
        userId: member.userId,
      }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Remove member error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
