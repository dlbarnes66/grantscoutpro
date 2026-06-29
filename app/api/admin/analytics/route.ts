import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.count();
    const grants = await prisma.grant.count();
    const subscriptions = await prisma.user.count({
      where: { subscriptionStatus: "active" },
    });

    return NextResponse.json({
      users,
      grants,
      subscriptions,
    });
  } catch (err: any) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
