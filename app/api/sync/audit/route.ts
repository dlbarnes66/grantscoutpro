import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { logs } = await req.json();

    if (!logs || !Array.isArray(logs)) {
      return NextResponse.json({ error: "Missing logs array" }, { status: 400 });
    }

    let imported = 0;

    for (const log of logs) {
      await prisma.auditLog.create({
        data: {
          actorId: log.actorId,
          event: log.event,
          details: log.details,
          orgId: log.orgId,
        },
      });

      imported++;
    }

    return NextResponse.json({ imported });
  } catch (err: any) {
    console.error("Audit sync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
