import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, funderId, result } = await req.json();

    if (!userId || !funderId || !result) {
      return NextResponse.json(
        { error: "userId, funderId, and result are required" },
        { status: 400 }
      );
    }

    // Stubbed: no outreachHistory model exists in your Prisma schema.
    const entry = {
      id: "stub-outreach-history",
      userId,
      funderId,
      result,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ entry });
  } catch (err: any) {
    console.error("Outreach history save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
