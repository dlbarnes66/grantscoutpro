import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  await prisma.aiUsage.create({
    data: {
      workspaceId,
      userId,
      feature: "calendar",
      tokens: 32,
      cost: 0.0,
    },
  });

  return NextResponse.json({
    success: true,
    suggestions: [
      { task: "Grant submission", due: "2026-09-01" },
      { task: "Budget review", due: "2026-08-28" },
    ],
  });
}
