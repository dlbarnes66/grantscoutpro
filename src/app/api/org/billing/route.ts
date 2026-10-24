import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserOrg, countWorkspacesForOwner } from "@/lib/workspace/orgAccess";
import { getPlan, getPilotInfo } from "@/lib/plans";
import { getTrialState, trialDiscountAvailable, TRIAL_DISCOUNT_PERCENT } from "@/lib/billing/trial";

export const dynamic = "force-dynamic";

// Real account-level billing summary: the org's plan tier, its Stripe
// subscription state, and how many of the org's workspace slots are in
// use. This route used to be dead scaffolding that just echoed back
// whatever was posted to it - see src/app/(dashboard-group)/billing for
// the page that renders this.
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const org = await ensureUserOrg(userId);
    const pilot = getPilotInfo(org);
    const plan = getPlan(pilot.active && pilot.tier ? pilot.tier : org.tier ?? "basic");
    const workspacesUsed = await countWorkspacesForOwner(userId);
    const trialState = getTrialState(org);

    return NextResponse.json({
      success: true,
      org: {
        id: org.id,
        name: org.name,
        tier: org.tier,
        stripeCustomerId: org.stripeCustomerId,
        stripeSubscriptionId: org.stripeSubscriptionId,
        billingStatus: org.billingStatus,
        cancelAtPeriodEnd: org.cancelAtPeriodEnd,
        periodEnd: org.periodEnd,
      },
      plan,
      pilot,
      trial: {
        isTrial: trialState.isTrial,
        active: trialState.active,
        daysRemaining: trialState.daysRemaining,
        locked: trialState.locked,
        discountOffered: trialDiscountAvailable(trialState),
        discountPercent: TRIAL_DISCOUNT_PERCENT,
      },
      workspacesUsed,
    });
  } catch (err: any) {
    console.error("ORG BILLING GET ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
