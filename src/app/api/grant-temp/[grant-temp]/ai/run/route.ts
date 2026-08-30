import { auth } from "@clerk/nextjs/server";
// src/app/api/grant-temp/[grant-temp]/run/route.ts

import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { userId, sessionClaims } = await await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { prompt, workspaceId } = await req.json();
    if (!prompt || !workspaceId) {
      return NextResponse.json({ error: "prompt and workspaceId required" }, { status: 400 });
    }
    const result = {
      workspaceId,
      prompt,
      output: `AI run completed for workspace ${workspaceId}`,
    };
    return NextResponse.json(result);
  } catch (err) {
    console.error("AI run route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
