// src/lib/billing/syncWorkspaceBilling.ts

import Stripe from "stripe";
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-07-29.dahlia",
});

export async function syncWorkspaceBilling(workspaceId: string) {
  const billing = await prisma.workspaceBilling.findUnique({
    where: { workspaceId },
  });

  if (!billing?.stripeSubscriptionId) {
    return { success: false, reason: "no_subscription" };
  }

  const subscription = await stripe.subscriptions.retrieve(
    billing.stripeSubscriptionId
  );

  const periodStart = subscription.billing_cycle_anchor
    ? new Date(subscription.billing_cycle_anchor * 1000)
    : null;

  const periodEnd = subscription.cancel_at
    ? new Date(subscription.cancel_at * 1000)
    : null;

  await prisma.workspaceBilling.update({
    where: { workspaceId },
    data: {
      periodStart,
      periodEnd,
      plan: subscription.items.data[0]?.price.nickname ?? "unknown",
      status: subscription.status,
    },
  });

  return { success: true };
}
