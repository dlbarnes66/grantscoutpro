// src/lib/billing/initBilling.ts

import { prisma } from "@/lib/db";

/**
 * Initializes billing for a workspace.
 * Ensures WorkspaceBilling exists and is safe for usage tracking.
 */
export async function initBilling(workspaceId: string) {
  // Check if billing already exists
  const existing = await prisma.workspaceBilling.findUnique({
    where: { workspaceId },
  });

  if (existing) {
    return existing;
  }

  // Create a new billing record with safe defaults
  const billing = await prisma.workspaceBilling.create({
    data: {
      workspaceId,
      plan: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      usageSearches: 0,
      usageUploads: 0,
      usageMembers: 1,
      usageAI: 0,
      periodStart: new Date(),
      periodEnd: null,
    },
  });

  // Also ensure Workspace has safe defaults
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      plan: "free",
      billingStatus: "inactive",
      billingPeriod: "monthly",
      billingRenewalDate: null,
    },
  });

  return billing;
}
