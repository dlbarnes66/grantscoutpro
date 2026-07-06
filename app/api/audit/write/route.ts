import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, event, details } = await req.json();

    if (!userId || !event) {
      return NextResponse.json(
        { error: "Missing userId or event" },
        { status: 400 }
      );
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action: event,
        details,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Audit write error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
