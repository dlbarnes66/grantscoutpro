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

    // Stubbed: no closeoutHistory model in Prisma.
    const entry = {
      id: "stub-closeout-history",
      userId,
      grantId,
      result,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ entry });
  } catch (err: any) {
    console.error("Closeout history save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
