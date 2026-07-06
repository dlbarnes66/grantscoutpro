import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Placeholder logic — replace with real version saving later
    console.log("Saving document version:", body);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Version save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
