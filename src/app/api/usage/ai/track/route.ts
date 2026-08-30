import { auth } from "@clerk/nextjs/server";
// src/app/api/usage/ai/track/route.ts

import { NextResponse } from "next/server";
import { trackUsage } from "@/lib/billing/trackUsage";
export async function POST(req: Request) {
  const { userId, sessionClaims } = await await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { workspaceId, tokens } = await req.json();
    if (!workspaceId || typeof tokens !== "number") {
      return NextResponse.json({ error: "workspaceId and tokens required" }, { status: 400 });
    }
    await trackUsage(workspaceId, "ai", tokens);
    return NextResponse.json({
      workspaceId,
      tracked: tokens,
    });
  } catch (err) {
    console.error("AI usage track error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
