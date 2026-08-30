// src/lib/stripe.ts

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-07-29.dahlia",
});

export function verifyStripeSignature(rawBody: string, signature: string) {
  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

export function normalizeSubscription(sub: any) {
  return {
    id: sub.id,
    customerId: sub.customer,
    status: sub.status,
    periodStart: new Date(sub.billing_cycle_anchor * 1000),
    periodEnd: sub.current_period_end
      ? new Date(sub.current_period_end * 1000)
      : null,
  };
}

export function normalizeInvoice(inv: any) {
  return {
    id: inv.id,
    customerId: inv.customer,
    subscriptionId: inv.subscription,
    amountPaid: inv.amount_paid,
    currency: inv.currency,
  };
}
