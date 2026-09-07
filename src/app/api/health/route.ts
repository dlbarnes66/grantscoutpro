import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Unauthenticated on purpose -- this is the target for uptime
// monitoring (UptimeRobot, etc.), which can't log in. Checks a real
// DB round-trip rather than just "the server process is up," since a
// hung/unreachable Postgres is the failure mode that actually matters
// for a pilot user.
export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: "ok", db: "ok", latencyMs: Date.now() - startedAt },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("HEALTH CHECK DB ERROR:", err);
    return NextResponse.json(
      { status: "error", db: "unreachable" },
      { status: 503 }
    );
  }
}
