// src/lib/billing/logBillingEvent.ts

import { prisma } from "@/lib/db";

/**
 * Logs a billing event for auditing and debugging.
 * This is used by:
 * - Stripe webhook handlers
 * - subscription-sync routes
 * - plan upgrade/downgrade routes
 * - usage enforcement
 * - trial/pilot logic
 * - billing health monitor
 */
export async function logBillingEvent(
  workspaceId: string,
  type: string,
  message?: string,
  metadata?: any
) {
  try {
    await prisma.billingLog.create({
      data: {
        type,
        message,
        createdAt: new Date(),
      },
    });

    // Also store workspace-level audit logs
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        // This ensures updatedAt reflects billing changes
        updatedAt: new Date(),
      },
    });
  } catch (err) {
    console.error("Failed to log billing event:", err);
  }
}
