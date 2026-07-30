export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




export async function POST(req: Request) {
  try {
    const { cutoff } = await req.json();

    if (!cutoff) {
      return NextResponse.json(
        { error: "cutoff date is required" },
        { status: 400 }
      );
    }

    // Stubbed: your schema has no lastLogin field.
    // This endpoint is kept for UI compatibility but does not perform DB changes.
    return NextResponse.json({
      status: "ok",
      message: "User purge stubbed (no-op). No database changes performed.",
      cutoff,
      purged: 0,
    });
  } catch (err: any) {
    console.error("User purge error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
