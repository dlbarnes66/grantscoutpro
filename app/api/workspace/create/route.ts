// app/api/workspace/create/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { name, orgId } = await req.json();

    if (!name || !orgId) {
      return NextResponse.json(
        { success: false, error: "Missing name or orgId" },
        { status: 400 }
      );
    }

    // ⭐ Trial initialization
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const workspace = await prisma.workspace.create({
      data: {
        name,
        orgId,
        trialStartAt: now,
        trialEndAt: trialEnd,
        isLocked: false,
      },
    });

    return NextResponse.json({ success: true, workspace });
  } catch (error) {
    console.error("WORKSPACE CREATE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}
