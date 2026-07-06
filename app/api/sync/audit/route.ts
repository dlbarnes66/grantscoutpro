// app/api/sync/audit/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { logs } = await req.json();

    if (!logs || !Array.isArray(logs)) {
      return NextResponse.json(
        { success: false, error: "Invalid logs payload" },
        { status: 400 }
      );
    }

    const results: any[] = [];

    for (const log of logs) {
      const created = await prisma.auditLog.create({
        data: {
          // ⭐ These fields actually exist in your Prisma model
          action: log.action,
          details: log.details ?? null,
          userId: log.userId ?? null,
          orgId: log.orgId ?? null,
        },
      });

      results.push(created);
    }

    return NextResponse.json({
      success: true,
      logs: results,
    });
  } catch (error) {
    console.error("SYNC AUDIT ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync audit logs" },
      { status: 500 }
    );
  }
}
