export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";




export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Apply rate limit
    const result = await checkRateLimit(
      `ratelimit:user:${userId}`,
      50,         // limit
      60          // window in seconds
    );

    return NextResponse.json({
      success: true,
      userId,
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
