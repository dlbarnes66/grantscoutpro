export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";




export async function POST(req: Request) {
  const redis = getRedis();

  if (!redis) {
    return NextResponse.json(
      { error: "Redis unavailable during build" },
      { status: 500 }
    );
  }

  try {
    const { orgId } = await req.json();

    if (!orgId) {
      return NextResponse.json(
        { error: "orgId is required" },
        { status: 400 }
      );
    }

    const key = `ratelimit:org:${orgId}`;
    const value = await redis.get(key);

    return NextResponse.json({
      success: true,
      orgId,
      value
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
