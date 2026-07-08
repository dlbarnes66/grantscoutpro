import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing audit log ID" },
        { status: 400 }
      );
    }

    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!log) {
      return NextResponse.json(
        { error: "Audit log not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: log.id,
      userId: log.userId,
      userEmail: log.user?.email ?? null,
      action: log.action,
      details: log.details,
      timestamp: log.createdAt,
    });
  } catch (err: any) {
    console.error("Audit detail error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
