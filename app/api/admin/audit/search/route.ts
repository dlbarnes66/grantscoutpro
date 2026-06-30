import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { actorId, entity, action, from, to } = await req.json();

    const logs = await prisma.auditLog.findMany({
      where: {
        actorId: actorId ?? undefined,
        entity: entity ?? undefined,
        action: action ?? undefined,
        createdAt: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ logs });
  } catch (err: any) {
    console.error("Audit search error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
