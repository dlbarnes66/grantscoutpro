export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function GET(req: Request) {
  try {
    const actorId = req.headers.get("x-actor-id");
    const entity = req.headers.get("x-entity");
    const action = req.headers.get("x-action");

    const logs = await prisma.auditLog.findMany({
      where: {
        userId: actorId ?? undefined,   // ✔ FIXED FIELD NAME
        action: action ?? undefined,
        // If you have an entity field in metadata, we can filter it later
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        org: true,
      },
    });

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (err: any) {
    console.error("AUDIT SEARCH ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Failed to search audit logs" },
      { status: 500 }
    );
  }
}
