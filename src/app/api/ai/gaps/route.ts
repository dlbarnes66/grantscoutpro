import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId, text } = await req.json();
  if (!workspaceId || !text) {
    return NextResponse.json({ error: "workspaceId and text are required" }, { status: 400 });
  }

  const gaps = `Identified gaps: ${text}`;

  await prisma.aiUsage.create({
    data: {
      workspaceId,
      userId,
      feature: "gaps",
      tokens: text.length,
      cost: 0.0,
    },
  });

  return NextResponse.json({ success: true, gaps });
}
