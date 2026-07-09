import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { matchGrants } from "@/lib/grants/match/matchGrants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { workspaceId, tier, profile } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    // ⭐ Run matching engine
    const results = await matchGrants({
      workspaceId,
      tier,
      profile, // mission, geography, org type, budget, etc.
    });

    return NextResponse.json(results);
  } catch (err: any) {
    console.error("Grant matching error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
