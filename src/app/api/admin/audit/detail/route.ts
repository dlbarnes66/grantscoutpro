export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function GET(req: Request) {
  try {
    const id = req.headers.get("x-log-id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing log ID" },
        { status: 400 }
      );
    }

    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: true,
        org: true,
      },
    });

    if (!log) {
      return NextResponse.json(
        { success: false, error: "Audit log not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      log: {
        id: log.id,
        userId: log.userId,
        userEmail: log.user?.email ?? null,
        action: log.action,
        metadata: log.metadata,   // ✔ FIXED FIELD NAME
        timestamp: log.createdAt,
      },
    });
  } catch (err: any) {
    console.error("AUDIT DETAIL ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit log detail" },
      { status: 500 }
    );
  }
}
