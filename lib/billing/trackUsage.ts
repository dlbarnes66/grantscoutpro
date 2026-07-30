// lib/billing/track-usage.ts

import { prisma } from "@/lib/prisma";

type UsageType = "searches" | "uploads" | "members" | "ai";

export async function trackUsage(
  workspaceId: string,
  type: UsageType
) {
  const billing = await prisma.workspaceBilling.findUnique({
    where: { workspaceId },
  });

  if (!billing) return null;

  switch (type) {
    case "searches":
      return prisma.workspaceBilling.update({
        where: { workspaceId },
        data: { usageSearches: billing.usageSearches + 1 },
      });

    case "uploads":
      return prisma.workspaceBilling.update({
        where: { workspaceId },
        data: { usageUploads: billing.usageUploads + 1 },
      });

    case "members":
      return prisma.workspaceBilling.update({
        where: { workspaceId },
        data: { usageMembers: billing.usageMembers + 1 },
      });

    case "ai":
      return prisma.workspaceBilling.update({
        where: { workspaceId },
        data: { usageAI: billing.usageAI + 1 },
      });
  }
}
