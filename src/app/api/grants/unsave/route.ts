export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId, grantId } = await request.json();

    if (!userId || !grantId) {
      return NextResponse.json(
        { error: "Missing userId or grantId" },
        { status: 400 }
      );
    }

    await prisma.savedGrant.deleteMany({
      where: {
        userId,
        grantId,
      },
    });

    return NextResponse.json({ removed: true });
  } catch (err: any) {
    console.error("Unsave grant error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
