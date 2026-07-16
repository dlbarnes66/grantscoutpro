import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = session.user.workspaceId;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        subscriptionTier: true,
        maxSeats: true,
        currentSeats: true,
        billingStatus: true,
        billingPeriod: true,
        billingRenewalDate: true,
        trialEnd: true,
        trialActive: true,
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const isPaid = workspace.billingStatus === "active";

    return NextResponse.json({
      billing: {
        isPaid,
        tier: workspace.subscriptionTier,
        maxSeats: workspace.maxSeats,
        currentSeats: workspace.currentSeats,
        status: workspace.billingStatus,
        period: workspace.billingPeriod,
        renewalDate: workspace.billingRenewalDate,
        trialEnd: workspace.trialEnd,
        trialActive: workspace.trialActive,
      },
    });
  } catch (err) {
    console.error("Billing status error:", err);
    return NextResponse.json(
      { error: "Failed to load billing status" },
      { status: 500 }
    );
  }
}
