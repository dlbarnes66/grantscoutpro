import { auth } from "@clerk/nextjs/server";
// src/app/api/grant-temp/[grant-temp]/route.ts

import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { userId, sessionClaims } = await await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "prompt required" }, { status: 400 });
    }
    // Placeholder AI response (replace with your model later)
    const result = {
      prompt,
      output: `AI processed: ${prompt}`,
    };
    return NextResponse.json(result);
  } catch (err) {
    console.error("AI route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
