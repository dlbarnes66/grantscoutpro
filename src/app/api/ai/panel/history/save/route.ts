export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




export async function POST(req: Request) {
  try {
    const { userId, grantId, result } = await req.json();

    if (!userId || !grantId || !result) {
      return NextResponse.json(
        { error: "userId, grantId, and result are required" },
        { status: 400 }
      );
    }

    // Stubbed: no reviewerPanelHistory model exists in your Prisma schema.
    const entry = {
      id: "stub-reviewer-panel-history",
      userId,
      grantId,
      result,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ entry });
  } catch (err: any) {
    console.error("Reviewer panel history save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
