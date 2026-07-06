// app/api/workspace/status-sync/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    // Load workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        trialEndAt: true,
        isLocked: true,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { success: false, error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Recalculate lock status
    let isLocked = workspace.isLocked;

    if (workspace.trialEndAt && workspace.trialEndAt < new Date()) {
      isLocked = true;
    }

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { isLocked },
    });

    return NextResponse.json({ success: true, workspace: updated });
  } catch (error) {
    console.error("STATUS SYNC ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync workspace status" },
      { status: 500 }
    );
  }
}
