export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




export async function POST(req: Request) {
  try {
    const { sourceOrgId, targetOrgId } = await req.json();

    if (!sourceOrgId || !targetOrgId) {
      return NextResponse.json(
        { error: "sourceOrgId and targetOrgId are required" },
        { status: 400 }
      );
    }

    // Stubbed: your schema has no Organization / TeamMember models.
    // This endpoint is kept for UI compatibility but does not perform DB changes.
    return NextResponse.json({
      status: "ok",
      message: "Organization merge stubbed (no-op). No database changes performed.",
      sourceOrgId,
      targetOrgId,
    });
  } catch (err: any) {
    console.error("Org merge error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
