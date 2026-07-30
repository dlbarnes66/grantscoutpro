export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




export async function POST(req: Request) {
  try {
    const { orgId, type, config } = await req.json();

    if (!orgId || !type || !config) {
      return NextResponse.json(
        { error: "orgId, type, and config are required" },
        { status: 400 }
      );
    }

    // Stubbed: your schema has no SSOConfig or orgId fields.
    // This endpoint is kept for UI compatibility but does not perform DB changes.
    return NextResponse.json({
      status: "ok",
      message: "SSO config stubbed (no-op). No database changes performed.",
      orgId,
      type,
      config,
    });
  } catch (err: any) {
    console.error("SSO config error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
