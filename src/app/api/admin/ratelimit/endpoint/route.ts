export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";




export async function POST(req: Request) {
  try {
    const { endpoint } = await req.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: "endpoint is required" },
        { status: 400 }
      );
    }

    // Apply rate limit
    const result = await checkRateLimit(
      `ratelimit:endpoint:${endpoint}`,
      100,        // limit
      60          // window in seconds
    );

    return NextResponse.json({
      success: true,
      endpoint,
      allowed: result.allowed,
      remaining: result.remaining
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
