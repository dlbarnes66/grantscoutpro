import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, action, metadata } = await req.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing userId or action" },
        { status: 400 }
      );
    }

    await prisma.activityLog.create({
      data: {
        userId,
        action,
        metadata,
      },
    });

    return NextResponse.json({ logged: true });
  } catch (err: any) {
    console.error("Activity log error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
