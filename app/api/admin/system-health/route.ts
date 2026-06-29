import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbCheck = await prisma.user.count().catch(() => null);

    const health = {
      database: dbCheck !== null ? "online" : "offline",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({ health });
  } catch (err: any) {
    console.error("System health error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
