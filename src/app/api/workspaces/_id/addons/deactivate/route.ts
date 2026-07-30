import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;
    const body = await request.json();

    const { addonType } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    if (!addonType) {
      return NextResponse.json(
        { error: "Missing addonType" },
        { status: 400 }
      );
    }

    const existing = await prisma.workspaceAddon.findFirst({
      where: {
        workspaceId,
        addonType
      }
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Addon not found for this workspace" },
        { status: 404 }
      );
    }

    const addon = await prisma.workspaceAddon.update({
      where: { id: existing.id },
      data: {
        active: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, addon });
  } catch (err: any) {
    console.error("WORKSPACE ADDON DEACTIVATE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
