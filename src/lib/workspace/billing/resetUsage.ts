// src/lib/workspace/billing/resetUsage.ts

import { prisma } from "@/lib/db";
import { logBillingEvent } from "@/lib/billing/logBillingEvent";

/**
 * Resets usage counters at the start of a new billing period.
 */
export async function resetWorkspaceUsage(workspaceId: string) {
  await prisma.workspaceBilling.update({
    where: { workspaceId },
    data: {
      usageSearches: 0,
      usageUploads: 0,
      usageMembers: 1,
      usageAI: 0,
      periodStart: new Date(),
      periodEnd: null,
    },
  });

  await logBillingEvent(workspaceId, "usage_reset", "Usage counters reset");
}
