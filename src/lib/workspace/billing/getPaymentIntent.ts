// src/lib/workspace/billing/getPaymentIntent.ts

import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe/client";

export async function getWorkspacePaymentIntent(workspaceId: string, amount: number) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { stripeCustomerId: true },
  });

  if (!workspace?.stripeCustomerId) return null;

  const intent = await stripe.paymentIntents.create({
    customer: workspace.stripeCustomerId,
    amount,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
  });

  return intent;
}
