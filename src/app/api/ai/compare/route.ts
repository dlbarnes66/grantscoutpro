import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId, a, b } = await req.json();
  if (!workspaceId || !a || !b) return NextResponse.json({ error: "workspaceId and two texts required" }, { status: 400 });

  const comparison = `Comparison between A and B`;

  await prisma.aiUsage.create({
    data: { workspaceId, userId, feature: "compare", tokens: a.length + b.length, cost: 0.0 }
  });

  return NextResponse.json({ success: true, comparison });
}
