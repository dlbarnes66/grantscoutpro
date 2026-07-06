// app/api/trial/status/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const workspaceId = req.headers.get("x-workspace-id");
    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        trialStartAt: true,
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

    return NextResponse.json({
      success: true,
      trialStartAt: workspace.trialStartAt,
      trialEndAt: workspace.trialEndAt,
      isLocked: workspace.isLocked,
    });
  } catch (error) {
    console.error("TRIAL STATUS ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trial status" },
      { status: 500 }
    );
  }
}
