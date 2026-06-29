import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    const members = await prisma.teamMember.findMany({
      where: { orgId },
      include: { user: true },
    });

    const apps = await prisma.application.findMany({
      where: { orgId },
    });

    const logs = await prisma.auditLog.findMany({
      where: { orgId },
    });

    return NextResponse.json({
      members,
      applications: apps,
      auditLogs: logs,
    });
  } catch (err: any) {
    console.error("Split summary error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
