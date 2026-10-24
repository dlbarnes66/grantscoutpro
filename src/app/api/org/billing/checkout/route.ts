import { auth } from "@clerk/nextjs/server";
import { getAppUrl } from "@/lib/appUrl";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, getPriceIdForPlan, type BillingInterval } from "@/lib/stripe";
import { ensureUserOrg } from "@/lib/workspace/orgAccess";
import { getTrialState, trialCouponId, trialDiscountAvailable } from "@/lib/billing/trial";

export const dynamic = "force-dynamic";

// Starts a new Stripe Checkout subscription for the caller's org. Plans
// are billed once per account (Org), not per workspace - see
// resolveEffectivePlanId in src/lib/plans.ts. Only meant for an org that
// doesn't already have an active subscription; once one exists, plan
// changes/cancellation go through the Stripe Customer Portal (see
// ../portal) so Stripe handles proration instead of this app guessing.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const org = await ensureUserOrg(userId);

    if (org.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "Your account already has an active subscription. Use Manage Billing to change plans." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const planId = body.planId as string | undefined;
    const interval = (body.interval as BillingInterval | undefined) ?? "monthly";

    if (!planId) {
      return NextResponse.json({ error: "planId is required" }, { status: 400 });
    }

    let priceId: string;
    try {
      priceId = getPriceIdForPlan(planId, interval);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // Reuse the Stripe customer if this org already has one on file (e.g.
    // a prior subscription was canceled), otherwise create one.
    let customerId = org.stripeCustomerId ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { orgId: org.id },
      });
      customerId = customer.id;
    }

    // Save the customer before creating the session, so a failed session
    // can be retried without creating another Stripe customer each time.
    if (!org.stripeCustomerId) {
      await prisma.org.update({ where: { id: org.id }, data: { stripeCustomerId: customerId } });
    }

    const appUrl = await getAppUrl();
    const returnPath = `/billing`;

    // Last 5 days of the free trial: take 10% off (Stripe coupon from
    // STRIPE_TRIAL_COUPON_ID). Decided here on the server from the account's
    // own trial dates, so it cannot be claimed outside the window.
    const trial = getTrialState(org);
    const couponId = trialDiscountAvailable(trial) ? trialCouponId() : undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ...(couponId ? { discounts: [{ coupon: couponId }] } : {}),
      customer: customerId,
      client_reference_id: org.id,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { orgId: org.id, planId, kind: "org_plan" },
      },
      metadata: { orgId: org.id, planId, kind: "org_plan" },
      success_url: `${appUrl}${returnPath}?checkout=success`,
      cancel_url: `${appUrl}${returnPath}?checkout=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("ORG BILLING CHECKOUT ERROR:", err);
    return NextResponse.json({ error: err.message ?? "Checkout failed" }, { status: 500 });
  }
}
