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

    const { trialActive, trialLocked, trialEnd } = await req.json();

    const workspace = await prisma.workspace.update({
      where: { id: params.workspaceId },
      data: {
        trialActive,
        trialLocked,
        trialEnd,
      },
    });

    await logActivity(params.workspaceId, "trial_override", {
      trialActive,
      trialLocked,
      trialEnd,
    });

    await sendNotification(
      params.workspaceId,
      "trial_override",
      "Workspace trial settings were overridden by an administrator",
      {
        trialActive,
        trialLocked,
        trialEnd,
      }
    );

    return NextResponse.json(workspace);
  } catch (error: any) {
    console.error("Trial override error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
