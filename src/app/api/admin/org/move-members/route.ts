export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




export async function POST(req: Request) {
  try {
    const { assignments } = await req.json();

    if (!Array.isArray(assignments)) {
      return NextResponse.json(
        { error: "assignments[] is required" },
        { status: 400 }
      );
    }

    // Stubbed: your schema has no TeamMember or orgId fields.
    // This endpoint is kept for UI compatibility but does not perform DB changes.
    return NextResponse.json({
      status: "ok",
      message: "Move members stubbed (no-op). No database changes performed.",
      moved: assignments.length,
    });
  } catch (err: any) {
    console.error("Move members error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
