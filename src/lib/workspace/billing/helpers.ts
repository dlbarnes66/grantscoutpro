// src/lib/workspace/billing/helpers.ts

import { prisma } from "@/lib/db";

/**
 * Returns workspace billing summary including:
 * - plan
 * - usage
 * - limits
 * - renewal date
 * - billing status
 */
export async function getWorkspaceBillingSummary(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      plan: true,
      billingStatus: true,
      billingPeriod: true,
      billingRenewalDate: true,
      workspaceBilling: {
        select: {
          usageSearches: true,
          usageUploads: true,
          usageMembers: true,
          usageAI: true,
          periodStart: true,
          periodEnd: true,
        },
      },
    },
  });

  if (!workspace) return null;

  return {
    plan: workspace.plan,
    status: workspace.billingStatus,
    period: workspace.billingPeriod,
    renewal: workspace.billingRenewalDate,
    usage: workspace.workspaceBilling,
  };
}
