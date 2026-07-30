// lib/billing/increment-usage.ts

import { prisma } from "@/lib/prisma";

type UsageType = "searches" | "uploads" | "ai" | "members";

export async function incrementUsage(
  workspaceId: string,
  type: UsageType
) {
  const field = (`usage${capitalize(type)}` as
    | "usageSearches"
    | "usageUploads"
    | "usageAI"
    | "usageMembers");

  return prisma.workspaceBilling.update({
    where: { workspaceId },
    data: {
      [field]: { increment: 1 },
    },
  });
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
