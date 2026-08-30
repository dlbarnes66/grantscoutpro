import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId, addonId, amount, period } = await req.json();

  if (!workspaceId || !addonId || !amount || !period) {
    return NextResponse.json(
      { error: "workspaceId, addonId, amount, and period are required" },
      { status: 400 }
    );
  }

  try {
    const billing = await prisma.addonBilling.create({
      data: {
        workspaceId,
        addonId,
        amount,
        period,
        status: "active",
      },
    });

    return NextResponse.json({ success: true, billing });
  } catch (err: any) {
    console.error("ADDON PURCHASE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
