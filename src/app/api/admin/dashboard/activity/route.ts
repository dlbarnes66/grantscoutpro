export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        org: true,
      },
      take: 50,
    });

    const formatted = logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      userEmail: log.user?.email ?? null,
      action: log.action,
      metadata: log.metadata,      // ✔ FIXED FIELD NAME
      createdAt: log.createdAt,
    }));

    return NextResponse.json({
      success: true,
      logs: formatted,
    });
  } catch (err: any) {
    console.error("ADMIN ACTIVITY ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}
