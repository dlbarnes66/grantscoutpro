import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId, profile, grant } = await req.json();
  if (!workspaceId || !profile || !grant) {
    return NextResponse.json({ error: "workspaceId, profile, and grant are required" }, { status: 400 });
  }

  const matchScore = Math.random();

  await prisma.aiUsage.create({
    data: {
      workspaceId,
      userId,
      feature: "matching",
      tokens: profile.length + grant.length,
      cost: 0.0,
    },
  });

  return NextResponse.json({ success: true, matchScore });
}
