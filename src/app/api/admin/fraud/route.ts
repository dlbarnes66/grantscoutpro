export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        AuditLog: true,   // FIXED
      },
    });

    const enriched = flaggedUsers.map((u) => ({
      id: u.id,
      email: u.email,
      status: u.status,
      renewalDate: u.renewalDate,
      stripeCustomerId: u.stripeCustomerId,
      auditLogCount: u.AuditLog.length,          // FIXED
      suspiciousActivity: u.AuditLog.length > 50 // FIXED
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
