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

    // Stubbed: your schema has no budgetHistory model.
    // No database writes are performed.
    const entry = {
      id: "stub-budget-history",
      userId,
      grantId,
      result,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ entry });
  } catch (err: any) {
    console.error("Budget history save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
