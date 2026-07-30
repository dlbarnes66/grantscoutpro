import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;
    const body = await request.json();

    const { message, userId } = body;

    if (!workspaceId || !userId || !message) {
      return NextResponse.json(
        { error: "Missing workspaceId, userId, or message" },
        { status: 400 }
      );
    }

    // Basic chat logging into WorkspaceActivity
    const activity = await prisma.workspaceActivity.create({
      data: {
        workspaceId,
        userId,
        action: "chat_message",
        metadata: { message }
      }
    });

    return NextResponse.json({ success: true, activity });
  } catch (err: any) {
    console.error("WORKSPACE CHAT ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
