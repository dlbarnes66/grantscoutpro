// src/lib/workspace/billing/getSubscription.ts
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-07-29.dahlia",
});

export async function getWorkspaceSubscription(workspaceId: string) {
  const billing = await prisma.workspaceBilling.findUnique({
    where: { workspaceId },
    select: { stripeSubscriptionId: true },
  });

  if (!billing?.stripeSubscriptionId) return null;

  const subscription = await stripe.subscriptions.retrieve(
    billing.stripeSubscriptionId
  );

  return subscription;
}
