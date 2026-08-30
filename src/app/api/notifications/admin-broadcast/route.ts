import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ==========================================
// POST /api/notifications/admin-broadcast
// Sends a notification to all members of a workspace
// ==========================================
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspaceId, title, message, type } = await req.json();

    if (!workspaceId || !title || !message || !type) {
      return NextResponse.json(
        { error: "workspaceId, title, message, and type are required" },
        { status: 400 }
      );
    }

    // Verify admin ownership
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (!workspace || workspace.ownerId !== userId) {
      return NextResponse.json(
        { error: "Only workspace owners can broadcast notifications" },
        { status: 403 }
      );
    }

    // Get all workspace members
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      select: { userId: true },
    });

    // Create notifications for each member
    const notifications = await prisma.notification.createMany({
      data: members.map((m) => ({
        userId: m.userId,
        workspaceId,
        type,       // REQUIRED FIELD
        title,
        message,
        read: false,
      })),
    });

    return NextResponse.json({
      success: true,
      count: notifications.count,
    });
  } catch (err: any) {
    console.error("ADMIN BROADCAST ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
