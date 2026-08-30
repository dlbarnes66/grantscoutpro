import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const grantId = url.searchParams.get("grantId");

    if (!grantId) {
      return NextResponse.json(
        { error: "Missing grantId" },
        { status: 400 }
      );
    }

    const timeline = await prisma.agentHistory.findMany({
      where: { grantId, userId },
    });

    return NextResponse.json({ success: true, timeline });
  } catch (err: any) {
    console.error("GRANTS TIMELINE GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { grantId, action, note } = await req.json().catch(() => ({}));

    if (!grantId || !action) {
      return NextResponse.json(
        { error: "Missing grantId or action" },
        { status: 400 }
      );
    }

    const entry = await prisma.agentHistory.create({
      data: {
        grantId,
        userId,
        action,
        note: note || null,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    console.error("GRANTS TIMELINE POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
