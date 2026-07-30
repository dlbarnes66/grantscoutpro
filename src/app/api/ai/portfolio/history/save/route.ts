export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




export async function POST(req: Request) {
  try {
    const { userId, result } = await req.json();

    if (!userId || !result) {
      return NextResponse.json(
        { error: "userId and result are required" },
        { status: 400 }
      );
    }

    // Stubbed: no portfolioHistory model exists in your Prisma schema.
    const entry = {
      id: "stub-portfolio-history",
      userId,
      result,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ entry });
  } catch (err: any) {
    console.error("Portfolio history save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
