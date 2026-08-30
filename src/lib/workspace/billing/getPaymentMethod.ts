// src/lib/workspace/billing/getPaymentMethod.ts
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-07-29.dahlia",
});

export async function getWorkspacePaymentMethods(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { stripeCustomerId: true },
  });

  if (!workspace?.stripeCustomerId) return [];

  const methods = await stripe.paymentMethods.list({
    customer: workspace.stripeCustomerId,
    type: "card",
  });

  return methods.data;
}
