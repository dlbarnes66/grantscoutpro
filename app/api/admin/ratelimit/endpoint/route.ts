import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { endpoint } = await req.json();

    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }

    const result = await rateLimit({
      key: `endpoint:${endpoint}`,
      limit: 500, // 500 requests/min
      windowSeconds: 60,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Endpoint rate limit error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
