import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId, text } = await req.json();
  if (!workspaceId || !text) return NextResponse.json({ error: "workspaceId and text required" }, { status: 400 });

  const review = `Reviewer notes: ${text}`;

  await prisma.aiUsage.create({
    data: { workspaceId, userId, feature: "reviewer", tokens: text.length, cost: 0.0 }
  });

  return NextResponse.json({ success: true, review });
}
