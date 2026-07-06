import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();

    // Compliance signals based on fields that ACTUALLY exist in your schema
    const flaggedUsers = await prisma.user.findMany({
      where: {
        OR: [
          // Users with delinquent status
          { status: "delinquent" },

          // Users whose renewal date has passed
          {
            renewalDate: {
              lt: now,
            },
          },

          // Users missing Stripe customer ID (billing incomplete)
          {
            stripeCustomerId: null,
          },
        ],
      },
      select: {
        id: true,
        email: true,
        status: true,
        renewalDate: true,
        stripeCustomerId: true,
      },
    });

    return NextResponse.json({
      flaggedCount: flaggedUsers.length,
      flaggedUsers,
    });
  } catch (err: any) {
    console.error("Compliance Scan Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
