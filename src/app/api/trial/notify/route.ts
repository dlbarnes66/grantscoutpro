export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function POST() {
  try {
    const now = new Date();
    const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    // Your Workspace model contains "trialEnd", NOT "trialEndAt"
    const workspaces = await prisma.workspace.findMany({
      where: {
        trialEnd: {
          not: null,
          lte: inThreeDays,
          gt: now,
        },
      },
    });

    return NextResponse.json({
      success: true,
      upcomingExpirations: workspaces,
    });
  } catch (err: any) {
    console.error("TRIAL NOTIFY ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
