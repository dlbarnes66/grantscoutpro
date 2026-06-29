import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { actorId, event, details } = await req.json();

    if (!actorId || !event) {
      return NextResponse.json(
        { error: "Missing actorId or event" },
        { status: 400 }
      );
    }

    await prisma.auditLog.create({
      data: {
        actorId,
        event,
        details,
      },
    });

    return NextResponse.json({ logged: true });
  } catch (err: any) {
    console.error("Audit log error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
