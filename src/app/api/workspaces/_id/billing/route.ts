import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;

    const billing = await prisma.workspaceBilling.findUnique({
      where: { workspaceId }
    });

    const addons = await prisma.addonBilling.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" }
    });

    const aiUsage = await prisma.aiUsage.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      billing,
      addons,
      aiUsage
    });
  } catch (err: any) {
    console.error("WORKSPACE BILLING ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
