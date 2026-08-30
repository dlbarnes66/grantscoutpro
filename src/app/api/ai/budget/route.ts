import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId, items } = await req.json();
  if (!workspaceId || !items || !Array.isArray(items)) {
    return NextResponse.json({ error: "workspaceId and items array required" }, { status: 400 });
  }

  const total = items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);

  await prisma.aiUsage.create({
    data: { workspaceId, userId, feature: "budget", tokens: items.length, cost: 0.0 }
  });

  return NextResponse.json({ success: true, total });
}
