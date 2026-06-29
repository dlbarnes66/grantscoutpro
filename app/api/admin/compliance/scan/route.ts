import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const flaggedUsers = await prisma.user.findMany({
      where: {
        OR: [
          { failedPayments: { gt: 2 } },
          { loginAttempts: { gt: 15 } },
        ],
      },
    });

    const flaggedOrgs = await prisma.organization.findMany({
      where: {
        subscriptionStatus: "delinquent",
      },
    });

    const flaggedApps = await prisma.application.findMany({
      where: {
        status: "submitted",
        content: { contains: "plagiarism" },
      },
    });

    return NextResponse.json({
      users: flaggedUsers,
      organizations: flaggedOrgs,
      applications: flaggedApps,
    });
  } catch (err: any) {
    console.error("Compliance scan error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
