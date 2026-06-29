import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stripeCustomerId: true,
        subscriptionStatus: true,
      },
    });

    return NextResponse.json({ status: user?.subscriptionStatus ?? "none" });
  } catch (err: any) {
    console.error("Billing status error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
