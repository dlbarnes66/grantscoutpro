export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
  try {
    const { workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    // Your Workspace model contains:
    // - trialStart
    // - trialEnd
    //
    // It does NOT contain:
    // - trialEndAt
    // - isLocked

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        trialStart: true,
        trialEnd: true,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const expired =
      workspace.trialEnd !== null && workspace.trialEnd < now;

    return NextResponse.json({
      success: true,
      trial: {
        start: workspace.trialStart,
        end: workspace.trialEnd,
        expired,
      },
    });
  } catch (err: any) {
    console.error("WORKSPACE STATUS SYNC ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
