export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
  try {
    const { name, orgId } = await req.json();

    if (!name || !orgId) {
      return NextResponse.json(
        { error: "Missing name or orgId" },
        { status: 400 }
      );
    }

    const now = new Date();
    const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7‑day trial

    // Your Workspace model contains:
    // - id
    // - name
    // - slug
    // - ownerId
    // - trialStart
    // - trialEnd
    //
    // It does NOT contain:
    // - trialStartAt
    // - trialEndAt
    // - isLocked

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug: `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
        ownerId: orgId,
        trialStart: now,
        trialEnd: trialEnd,
      },
    });

    return NextResponse.json({
      success: true,
      workspace,
    });
  } catch (err: any) {
    console.error("WORKSPACE CREATE ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
