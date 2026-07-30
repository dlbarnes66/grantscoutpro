export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
  try {
    const { workspaceId, addonType } = await req.json();

    if (!workspaceId || !addonType) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId or addonType" },
        { status: 400 }
      );
    }

    await prisma.workspaceAddon.create({
      data: {
        workspaceId,
        addonType,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADDON ACTIVATE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to activate addon" },
      { status: 500 }
    );
  }
}
