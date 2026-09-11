import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ensureUserOrg } from "@/lib/workspace/orgAccess";

export const dynamic = "force-dynamic";

// Sends the caller to Stripe's hosted Customer Portal to change plan,
// update payment method, or cancel their org's subscription. Deliberately
// not hand-rolling upgrade/downgrade/proration logic here - Stripe's
// portal already does this correctly and stays in sync via the same
// webhook this app listens on (see /api/webhooks/stripe).
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const org = await ensureUserOrg(userId);

    if (!org.stripeCustomerId) {
      return NextResponse.json(
        { error: "Your account doesn't have a Stripe customer yet. Subscribe to a plan first." },
        { status: 400 }
      );
    }

    const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
    const portal = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${appUrl}/billing`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (err: any) {
    console.error("ORG BILLING PORTAL ERROR:", err);
    return NextResponse.json({ error: err.message ?? "Could not open billing portal" }, { status: 500 });
  }
}
