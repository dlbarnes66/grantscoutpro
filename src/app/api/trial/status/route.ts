export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    // Your Workspace model contains: trialStart, trialEnd
    // It does NOT contain: locked
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
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
    const isExpired =
      workspace.trialEnd !== null && workspace.trialEnd < now;

    return NextResponse.json({
      success: true,
      trial: {
        start: workspace.trialStart,
        end: workspace.trialEnd,
        expired: isExpired,
      },
    });
  } catch (err: any) {
    console.error("TRIAL STATUS ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
