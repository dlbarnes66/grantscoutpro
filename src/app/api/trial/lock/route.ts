export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function POST() {
  try {
    const now = new Date();

    // Your Workspace model contains "trialEnd", NOT "trialEndAt"
    const expired = await prisma.workspace.findMany({
      where: {
        trialEnd: {
          not: null,
          lt: now,
        },
      },
    });

    // If your schema does NOT contain a "locked" field,
    // we simply return the expired workspaces.
    return NextResponse.json({
      success: true,
      expiredWorkspaces: expired,
    });
  } catch (err: any) {
    console.error("TRIAL LOCK ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
