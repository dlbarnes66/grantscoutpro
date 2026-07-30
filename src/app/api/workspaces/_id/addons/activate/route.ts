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

    // Find existing addon for this workspace + addonType
    const existing = await prisma.workspaceAddon.findFirst({
      where: {
        workspaceId,
        addonType
      }
    });

    let addon;

    if (existing) {
      addon = await prisma.workspaceAddon.update({
        where: { id: existing.id },
        data: {
          active: true,
          updatedAt: new Date()
        }
      });
    } else {
      addon = await prisma.workspaceAddon.create({
        data: {
          workspaceId,
          addonType,
          active: true
        }
      });
    }

    return NextResponse.json({ success: true, addon });
  } catch (err: any) {
    console.error("WORKSPACE ADDON ACTIVATE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
