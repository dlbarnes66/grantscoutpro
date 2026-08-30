import { auth } from "@clerk/nextjs/server";
// src/app/api/usage/reset/route.ts

import { NextResponse } from "next/server";
import { resetWorkspaceUsage } from "@/lib/workspace/billing/resetUsage";
export async function POST(req: Request) {
  const { userId, sessionClaims } = await await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { workspaceId } = await req.json();
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }
    await resetWorkspaceUsage(workspaceId);
    return NextResponse.json({
      workspaceId,
      reset: true,
    });
  } catch (err) {
    console.error("usage reset error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
