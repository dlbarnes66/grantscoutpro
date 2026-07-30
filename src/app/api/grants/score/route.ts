export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreGrant } from "@/lib/grants/score/scoreGrant";

export async function POST(request: NextRequest) {
  try {
    const { grantId, tier, profile } = await request.json();

    if (!grantId) {
      return NextResponse.json(
        { error: "Missing grantId" },
        { status: 400 }
      );
    }

    const scored = await scoreGrant({
      grantId,
      tier,
      profile,
    });

    return NextResponse.json(scored);
  } catch (err: any) {
    console.error("GrantRadar scoring error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
