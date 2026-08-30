import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workspace = await prisma.workspace.findFirst({
      where: { orgId },
      include: {
        billing: true,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const billing = workspace.billing;

    return NextResponse.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        subscriptionTier: workspace.subscriptionTier,
        billingStatus: workspace.billingStatus,
        billingPeriod: workspace.billingPeriod,
        billingRenewalDate: workspace.billingRenewalDate,
        maxSeats: workspace.maxSeats,
        currentSeats: workspace.currentSeats,
        trialActive: workspace.trialActive,
        trialLocked: workspace.trialLocked,
        trialStart: workspace.trialStart,
        trialEnd: workspace.trialEnd,
      },
      billing: billing
        ? {
            plan: billing.plan,
            stripeCustomerId: billing.stripeCustomerId,
            stripeSubscriptionId: billing.stripeSubscriptionId,
            usageSearches: billing.usageSearches,
            usageUploads: billing.usageUploads,
            usageMembers: billing.usageMembers,
            usageAI: billing.usageAI,
            periodStart: billing.periodStart,
            periodEnd: billing.periodEnd,
            seats: billing.seats,
            aiTokensMonthly: billing.aiTokensMonthly,
            aiTokensUsed: billing.aiTokensUsed,
            documentLimit: billing.documentLimit,
            storageLimitMb: billing.storageLimitMb,
          }
        : null,
    });
  } catch (err) {
    console.error("BILLING ROOT ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
