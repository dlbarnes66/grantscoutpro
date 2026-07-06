import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.count();
    const grants = await prisma.grant.count();

    // Your schema uses "status", not "subscriptionStatus"
    const activeSubs = await prisma.user.count({
      where: { status: "active" },
    });

    // Your schema has NO "application" model — remove it
    const applications = 0;

    return NextResponse.json({
      users,
      grants,
      activeSubscriptions: activeSubs,
      applications,
    });
  } catch (err: any) {
    console.error("Admin dashboard overview error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
