import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ==========================================
// POST /api/notifications/create
// Creates a single notification for a user
// ==========================================
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { targetUserId, workspaceId, type, title, message } = await req.json();

    if (!targetUserId || !type || !title || !message) {
      return NextResponse.json(
        { error: "targetUserId, type, title, and message are required" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId,
        workspaceId: workspaceId ?? null,
        type,
        title,
        message,
        read: false,
      },
    });

    return NextResponse.json({ success: true, notification });
  } catch (err: any) {
    console.error("NOTIFICATION CREATE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
