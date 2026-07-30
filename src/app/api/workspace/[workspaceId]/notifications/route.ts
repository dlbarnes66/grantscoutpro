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

    const body = await request.json();
    const { message, userId, type } = body;

    if (!message || !userId || !type) {
      return NextResponse.json(
        { error: "Missing message, userId, or type" },
        { status: 400 }
      );
    }

    const notification = await prisma.workspaceNotification.create({
      data: {
        workspaceId,
        userId,
        type,
        message,
        read: false
      }
    });

    return NextResponse.json({
      success: true,
      notification
    });
  } catch (err: any) {
    console.error("WORKSPACE NOTIFICATIONS ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
