// app/api/trial/notify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const now = new Date();
    const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const workspaces = await prisma.workspace.findMany({
      where: {
        trialEndAt: {
          not: null,
          lte: inThreeDays,
          gt: now,
        },
        isLocked: false,
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    const notifications = workspaces.flatMap((ws) =>
      ws.members.map((m) => ({
        workspaceId: ws.id,
        userId: m.userId,
        email: m.user.email,
        trialEndAt: ws.trialEndAt,
      }))
    );

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("TRIAL NOTIFY ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process trial notifications" },
      { status: 500 }
    );
  }
}
