import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";
import { logActivity } from "@/lib/ai/activity-log";
import { sendNotification } from "@/lib/notifications/sendNotification";

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN"]);

    const workspace = await prisma.workspace.update({
      where: { id: params.workspaceId },
      data: {
        trialLocked: false,
        trialActive: true,
      },
    });

    await logActivity(params.workspaceId, "trial_unlocked", {
      workspaceId: params.workspaceId,
    });

    await sendNotification(
      params.workspaceId,
      "trial_unlocked",
      "Workspace trial has been unlocked by an administrator",
      {}
    );

    return NextResponse.json(workspace);
  } catch (error: any) {
    console.error("Trial unlock error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
