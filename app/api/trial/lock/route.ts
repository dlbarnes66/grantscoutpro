// app/api/trial/lock/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  try {
    const now = new Date();

    const expired = await prisma.workspace.findMany({
      where: {
        trialEndAt: {
          not: null,
          lt: now,
        },
        isLocked: false,
      },
    });

    const ids = expired.map((w) => w.id);

    if (ids.length > 0) {
      await prisma.workspace.updateMany({
        where: { id: { in: ids } },
        data: { isLocked: true },
      });
    }

    return NextResponse.json({
      success: true,
      lockedCount: ids.length,
    });
  } catch (error) {
    console.error("TRIAL LOCK ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to lock expired workspaces" },
      { status: 500 }
    );
  }
}
