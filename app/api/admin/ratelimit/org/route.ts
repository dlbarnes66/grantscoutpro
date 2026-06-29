import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { orgId } = await req.json();

    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    const result = await rateLimit({
      key: `org:${orgId}`,
      limit: 1000, // 1000 requests/min
      windowSeconds: 60,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Org rate limit error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
