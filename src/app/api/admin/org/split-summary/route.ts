export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




export async function POST(req: Request) {
  try {
    const { orgId } = await req.json();

    if (!orgId) {
      return NextResponse.json(
        { error: "orgId is required" },
        { status: 400 }
      );
    }

    // Stubbed: your schema has no TeamMember or orgId fields.
    // This endpoint is kept for UI compatibility but does not perform DB changes.
    return NextResponse.json({
      status: "ok",
      message: "Split summary stubbed (no-op). No database queries performed.",
      orgId,
      members: [],
    });
  } catch (err: any) {
    console.error("Split summary error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
