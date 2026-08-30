import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspace = await prisma.workspace.findFirst({
      where: { orgId },
      include: { billing: true },
    });

    if (!workspace || !workspace.billing) {
      return NextResponse.json(
        { error: "Workspace or billing not found" },
        { status: 404 }
      );
    }

    const billing = workspace.billing;

    return NextResponse.json({
      status: workspace.billingStatus,
      tier: workspace.subscriptionTier,
      trialActive: workspace.trialActive,
      trialLocked: workspace.trialLocked,
      renewalDate: workspace.billingRenewalDate,
      periodStart: billing.periodStart,
      periodEnd: billing.periodEnd,
    });
  } catch (err) {
    console.error("STATUS ROUTE ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
