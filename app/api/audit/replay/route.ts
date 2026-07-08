import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { logId } = await req.json();

    if (!logId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const log = await prisma.auditLog.findUnique({ where: { id: logId } });

    return NextResponse.json({ replayed: true, log });
  } catch (err: any) {
    console.error("Audit replay error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
