import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;

    const searches = await prisma.searchAnalytics.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" }
    });

    const activity = await prisma.workspaceActivity.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" }
    });

    const insights = await prisma.workspaceInsight.findMany({
      where: {
        OR: [
          { primaryWorkspaceId: workspaceId },
          { secondaryWorkspaceId: workspaceId }
        ]
      }
    });

    return NextResponse.json({
      success: true,
      analytics: {
        searches,
        activity,
        insights
      }
    });
  } catch (err: any) {
    console.error("WORKSPACE ANALYTICS ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
