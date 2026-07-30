export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
  try {
    const logs = await req.json();

    if (!Array.isArray(logs)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    // Your AuditLog model only contains: id, action, createdAt
    // So we only store the action field.
    for (const log of logs) {
      if (typeof log.action === "string") {
        await prisma.auditLog.create({
          data: {
            action: log.action,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      stored: logs.length,
    });
  } catch (err: any) {
    console.error("AUDIT SYNC ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
