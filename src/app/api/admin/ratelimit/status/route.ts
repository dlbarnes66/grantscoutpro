export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";




export async function GET() {
  const redis = getRedis();

  if (!redis) {
    return NextResponse.json(
      { error: "Redis unavailable during build" },
      { status: 500 }
    );
  }

  try {
    const keys = await redis.keys("ratelimit:*");
    const values = await Promise.all(keys.map((k) => redis.get(k)));

    return NextResponse.json({
      success: true,
      keys,
      values
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
