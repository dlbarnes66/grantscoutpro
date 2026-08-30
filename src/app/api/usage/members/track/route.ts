import { auth } from "@clerk/nextjs/server";
// src/app/api/usage/members/track/route.ts

import { NextResponse } from "next/server";
import { trackUsage } from "@/lib/billing/trackUsage";
export async function POST(req: Request) {
  const { userId, sessionClaims } = await await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { workspaceId, count } = await req.json();
    if (!workspaceId || typeof count !== "number") {
      return NextResponse.json({ error: "workspaceId and count required" }, { status: 400 });
    }
    await trackUsage(workspaceId, "member", count);
    return NextResponse.json({
      workspaceId,
      tracked: count,
    });
  } catch (err) {
    console.error("member usage track error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
