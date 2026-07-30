export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




export async function POST(req: Request) {
  try {
    const { userId, newOrgId } = await req.json();

    if (!userId || !newOrgId) {
      return NextResponse.json(
        { error: "userId and newOrgId are required" },
        { status: 400 }
      );
    }

    // Stubbed: your schema has no Application / orgId fields.
    // This endpoint is kept for UI compatibility but does not perform DB changes.
    return NextResponse.json({
      status: "ok",
      message: "Move applications stubbed (no-op). No database changes performed.",
      userId,
      newOrgId,
    });
  } catch (err: any) {
    console.error("Move applications error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
