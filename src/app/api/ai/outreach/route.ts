import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId, audience } = await req.json();
  if (!workspaceId || !audience) {
    return NextResponse.json({ error: "workspaceId and audience are required" }, { status: 400 });
  }

  const outreach = `Outreach plan for: ${audience}`;

  await prisma.aiUsage.create({
    data: {
      workspaceId,
      userId,
      feature: "outreach",
      tokens: audience.length,
      cost: 0.0,
    },
  });

  return NextResponse.json({ success: true, outreach });
}
