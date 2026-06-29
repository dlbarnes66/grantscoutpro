import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.findMany({ include: { profile: true } });
    const grants = await prisma.grant.findMany();
    const applications = await prisma.application.findMany({
      include: { user: true, grant: true },
    });
    const orgs = await prisma.organization.findMany();
    const audit = await prisma.auditLog.findMany();

    return NextResponse.json({
      users,
      grants,
      applications,
      organizations: orgs,
      audit,
    });
  } catch (err: any) {
    console.error("Warehouse export error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
