import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const keys = await redis.keys("ratelimit:*");

    const entries = [];

    for (const key of keys) {
      const count = await redis.get(key);
      entries.push({ key, count: Number(count) });
    }

    return NextResponse.json({ entries });
  } catch (err: any) {
    console.error("Rate limit status error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
