import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;
    const body = await request.json();

    const { trialEnd, trialActive } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        trialEnd: trialEnd ? new Date(trialEnd) : null,
        trialActive: trialActive ?? true
      }
    });

    await prisma.workspaceActivity.create({
      data: {
        workspaceId,
        action: "trial_override",
        metadata: { trialEnd, trialActive }
      }
    });

    return NextResponse.json({ success: true, workspace });
  } catch (err: any) {
    console.error("WORKSPACE TRIAL OVERRIDE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
