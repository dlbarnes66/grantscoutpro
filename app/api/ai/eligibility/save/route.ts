import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, grantId, result } = await req.json();

    if (!userId || !grantId || !result) {
      return NextResponse.json(
        { error: "userId, grantId, and result are required" },
        { status: 400 }
      );
    }

    // Stubbed: no eligibilityHistory model exists in your Prisma schema.
    const entry = {
      id: "stub-eligibility-history",
      userId,
      grantId,
      result,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ entry });
  } catch (err: any) {
    console.error("Eligibility save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
