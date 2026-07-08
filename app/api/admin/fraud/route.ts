import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();

    const flaggedUsers = await prisma.user.findMany({
      where: {
        OR: [
          { status: "delinquent" },
          { renewalDate: { lt: now } },
          { stripeCustomerId: null },
        ],
      },
      include: {
        auditLogs: true,
      },
    });

    const enriched = flaggedUsers.map((u) => ({
      id: u.id,
      email: u.email,
      status: u.status,
      renewalDate: u.renewalDate,
      stripeCustomerId: u.stripeCustomerId,
      auditLogCount: u.auditLogs.length,
      suspiciousActivity: u.auditLogs.length > 50,
    }));

    return NextResponse.json({
      flaggedCount: enriched.length,
      users: enriched,
    });
  } catch (err: any) {
    console.error("Fraud Scan Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
