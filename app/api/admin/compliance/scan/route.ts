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
