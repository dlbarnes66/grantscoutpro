import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId, grantId } = await req.json();
  if (!workspaceId || !grantId) return NextResponse.json({ error: "workspaceId and grantId required" }, { status: 400 });

  const forecast = Math.random();

  await prisma.aiUsage.create({
    data: { workspaceId, userId, feature: "forecast", tokens: 32, cost: 0.0 }
  });

  return NextResponse.json({ success: true, forecast });
}
