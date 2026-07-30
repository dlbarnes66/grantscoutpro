import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    const grants = await prisma.grant.findMany({
      where: { workspaceId },
      select: {
        id: true,
        title: true,
        summary: true,
        status: true,
        deadline: true
      }
    });

    return NextResponse.json({
      success: true,
      grants
    });
  } catch (err: any) {
    console.error("WORKSPACE GRANTS ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
