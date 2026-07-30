import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;

    const notifications = await prisma.workspaceNotification.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, notifications });
  } catch (err: any) {
    console.error("WORKSPACE NOTIFICATIONS ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
