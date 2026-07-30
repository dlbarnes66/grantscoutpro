import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;
    const { email } = await request.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Missing email" },
        { status: 400 }
      );
    }

    // Extend trial or send trial-related email
    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        trialActive: true,
        trialLocked: false
      }
    });

    await prisma.workspaceActivity.create({
      data: {
        workspaceId,
        action: "trial_email_sent",
        metadata: { email }
      }
    });

    return NextResponse.json({
      success: true,
      workspace
    });
  } catch (err: any) {
    console.error("WORKSPACE TRIAL ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
