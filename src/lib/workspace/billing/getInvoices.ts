// src/lib/workspace/billing/getInvoices.ts

import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe/client";

export async function getWorkspaceInvoices(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { stripeCustomerId: true },
  });

  if (!workspace?.stripeCustomerId) return [];

  const invoices = await stripe.invoices.list({
    customer: workspace.stripeCustomerId,
    limit: 20,
  });

  return invoices.data;
}
