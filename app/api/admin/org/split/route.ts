import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { newOrgs } = await req.json();

    if (!Array.isArray(newOrgs)) {
      return NextResponse.json(
        { error: "newOrgs[] is required" },
        { status: 400 }
      );
    }

    // Stubbed: your schema has no Organization model.
    // This endpoint is kept for UI compatibility but does not perform DB changes.
    const createdOrgs = newOrgs.map((org) => ({
      id: `stub-${org.name}`,
      name: org.name,
      subscriptionStatus: "none",
    }));

    return NextResponse.json({
      status: "ok",
      message: "Organization split stubbed (no-op). No database changes performed.",
      createdOrgs,
    });
  } catch (err: any) {
    console.error("Org split error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
