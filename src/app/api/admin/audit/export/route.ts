export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";




export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      count: logs.length,
      logs,
    });
  } catch (err: any) {
    console.error("Audit export error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
