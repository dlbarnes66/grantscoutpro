export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




export async function POST(req: Request) {
  try {
    const { userId, results } = await req.json();

    if (!userId || !results) {
      return NextResponse.json(
        { error: "userId and results are required" },
        { status: 400 }
      );
    }

    // Stubbed: no matchHistory model exists in your Prisma schema.
    const entry = {
      id: "stub-match-history",
      userId,
      results,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ entry });
  } catch (err: any) {
    console.error("Matching history save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
