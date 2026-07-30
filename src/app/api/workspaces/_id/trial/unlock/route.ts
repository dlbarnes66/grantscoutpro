import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        trialLocked: false
      }
    });

    await prisma.workspaceActivity.create({
      data: {
        workspaceId,
        action: "trial_unlock",
        metadata: {}
      }
    });

    return NextResponse.json({ success: true, workspace });
  } catch (err: any) {
    console.error("WORKSPACE TRIAL UNLOCK ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
