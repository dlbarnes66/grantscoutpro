import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();

    // Fraud indicators based on REAL fields in your schema
    const flaggedUsers = await prisma.user.findMany({
      where: {
        OR: [
          // Delinquent billing status
          { status: "delinquent" },

          // Renewal date has passed
          {
            renewalDate: {
              lt: now,
            },
          },

          // Missing Stripe customer ID (billing incomplete)
          {
            stripeCustomerId: null,
          },
        ],
      },
      include: {
        auditLogs: true,
      },
    });

    // Additional fraud signal: unusually high audit log activity
    const enriched = flaggedUsers.map((u) => ({
      id: u.id,
      email: u.email,
      status: u.status,
      renewalDate: u.renewalDate,
      stripeCustomerId: u.stripeCustomerId,
      auditLogCount: u.auditLogs.length,
      suspiciousActivity: u.auditLogs.length > 50, // threshold
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
