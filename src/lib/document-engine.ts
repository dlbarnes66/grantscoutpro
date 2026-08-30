// src/lib/document-engine.ts

import { prisma } from "@/lib/db";
import { stripe, normalizeSubscription } from "@/lib/stripe";

/**
 * Fetch the workspace billing record.
 */
export async function getBilling(workspaceId: string) {
  const billing = await prisma.workspaceBilling.findUnique({
    where: { workspaceId },
  });

  if (!billing) {
    throw new Error("Billing record not found.");
  }

  return billing;
}

/**
 * Sync Stripe subscription → Prisma billing.
 */
export async function syncStripeToPrisma(workspaceId: string) {
  const billing = await getBilling(workspaceId);

  if (!billing.stripeSubscriptionId) return billing;

  const subscription = await stripe.subscriptions.retrieve(
    billing.stripeSubscriptionId
  );

  const normalized = normalizeSubscription(subscription);

  await prisma.workspaceBilling.update({
    where: { workspaceId },
    data: {
      plan: subscription.items.data[0].price.nickname?.toLowerCase() || "unknown",
      periodStart: normalized.periodStart,
      periodEnd: normalized.periodEnd,
    },
  });

  return getBilling(workspaceId);
}

/**
 * Update Stripe plan.
 */
export async function updateStripePlan(workspaceId: string, newPriceId: string) {
  const billing = await getBilling(workspaceId);

  if (!billing.stripeSubscriptionId) {
    throw new Error("Workspace has no Stripe subscription.");
  }

  const subscription = await stripe.subscriptions.retrieve(
    billing.stripeSubscriptionId
  );

  await stripe.subscriptions.update(billing.stripeSubscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: "always_invoice",
  });

  return syncStripeToPrisma(workspaceId);
}

/**
 * Reset monthly usage.
 */
export async function resetMonthlyUsage(workspaceId: string) {
  await prisma.workspaceBilling.update({
    where: { workspaceId },
    data: {
      aiTokensUsed: 0,
      usageSearches: 0,
      usageUploads: 0,
      usageAI: 0,
    },
  });

  return getBilling(workspaceId);
}

/**
 * Increment AI usage.
 */
export async function incrementAiUsage(workspaceId: string, tokens: number) {
  const billing = await getBilling(workspaceId);

  await prisma.workspaceBilling.update({
    where: { workspaceId },
    data: {
      aiTokensUsed: billing.aiTokensUsed + tokens,
    },
  });

  return getBilling(workspaceId);
}

/**
 * Increment storage usage.
 */
export async function incrementStorageUsage(workspaceId: string, bytes: number) {
  const billing = await getBilling(workspaceId);

  await prisma.workspaceBilling.update({
    where: { workspaceId },
    data: {
      usageUploads: billing.usageUploads + 1,
    },
  });

  return getBilling(workspaceId);
}

/**
 * Suspend workspace.
 */
export async function suspendWorkspace(workspaceId: string, adminId?: string) {
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      suspended: true,
      suspendedAt: new Date(),
    },
  });

  await prisma.workspaceSuspensionLog.create({
    data: {
      workspaceId,
      adminId,
      reason: "Billing suspension",
    },
  });

  return true;
}

/**
 * Unsuspend workspace.
 */
export async function unsuspendWorkspace(workspaceId: string) {
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      suspended: false,
      suspendedAt: null,
    },
  });

  return true;
}

/**
 * Add seat.
 */
export async function addSeat(workspaceId: string) {
  const billing = await getBilling(workspaceId);

  await prisma.workspaceBilling.update({
    where: { workspaceId },
    data: {
      seats: billing.seats + 1,
    },
  });

  return getBilling(workspaceId);
}

/**
 * Remove seat.
 */
export async function removeSeat(workspaceId: string) {
  const billing = await getBilling(workspaceId);

  if (billing.seats <= 1) {
    throw new Error("Cannot remove the last seat.");
  }

  await prisma.workspaceBilling.update({
    where: { workspaceId },
    data: {
      seats: billing.seats - 1,
    },
  });

  return getBilling(workspaceId);
}

/**
 * Log billing activity.
 */
export async function logBillingActivity(
  workspaceId: string,
  userId: string | null,
  type: string,
  description?: string
) {
  await prisma.workspaceBillingActivity.create({
    data: {
      workspaceId,
      userId,
      action: type, // matches WorkspaceBillingActivity schema
      description,
    },
  });
}
