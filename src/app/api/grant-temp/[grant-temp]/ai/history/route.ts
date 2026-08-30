import { auth } from "@clerk/nextjs/server";
// src/app/api/grant-temp/[grant-temp]/history/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function POST(req: Request) {
  const { userId, sessionClaims } = await await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { workspaceId } = await req.json();
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }
    const history = await prisma.aiUsage.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ workspaceId, history });
  } catch (err) {
    console.error("AI history route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
