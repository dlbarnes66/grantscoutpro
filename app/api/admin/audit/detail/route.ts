import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const log = await prisma.auditLog.findUnique({ where: { id } });

    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: log.id,
      actorId: log.actorId,
      entity: log.entity,
      action: log.action,
      timestamp: log.createdAt,
      before: JSON.parse(log.before),
      after: JSON.parse(log.after),
      changes: JSON.parse(log.changes),
      ip: log.ip,
      userAgent: log.userAgent,
    });
  } catch (err: any) {
    console.error("Audit detail error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
