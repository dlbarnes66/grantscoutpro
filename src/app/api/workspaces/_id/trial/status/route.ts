import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        trialStart: true,
        trialEnd: true,
        trialActive: true,
        trialLocked: true,
        trialDaysRemaining: true
      }
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, trial: workspace });
  } catch (err: any) {
    console.error("WORKSPACE TRIAL STATUS ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
