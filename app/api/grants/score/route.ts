import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { scoreGrant } from "@/lib/grants/score/scoreGrant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { grantId, tier, profile } = await req.json();

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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
