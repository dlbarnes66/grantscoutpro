import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activity = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: true,
      },
    });

    return NextResponse.json(
      activity.map((log) => ({
        id: log.id,
        userId: log.userId,
        userEmail: log.user?.email ?? null,
        action: log.action,
        details: log.details,
        createdAt: log.createdAt,
      }))
    );
  } catch (err: any) {
    console.error("Admin dashboard activity error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
