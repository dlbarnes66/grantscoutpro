import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const result = await rateLimit({
      key: `user:${userId}`,
      limit: 100, // 100 requests/min
      windowSeconds: 60,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("User rate limit error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
