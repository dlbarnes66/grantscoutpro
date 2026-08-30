// src/lib/billing/trackUsage.ts

import { prisma } from "@/lib/db";

type UsageType = "search" | "upload" | "member" | "ai";

export async function trackUsage(
  workspaceId: string,
  type: UsageType,
  amount: number = 1
) {
  const fieldMap: Record<UsageType, keyof typeof updateFields> = {
    search: "usageSearches",
    upload: "usageUploads",
    member: "usageMembers",
    ai: "usageAI",
  };

  const updateFields = {
    usageSearches: undefined as number | undefined,
    usageUploads: undefined as number | undefined,
    usageMembers: undefined as number | undefined,
    usageAI: undefined as number | undefined,
  };

  const field = fieldMap[type];

  if (!field) {
    console.warn(`trackUsage: Unknown usage type "${type}"`);
    return;
  }

  updateFields[field] = amount;

  await prisma.workspaceBilling.upsert({
    where: { workspaceId },
    update: {
      [field]: { increment: amount },
    },
    create: {
      workspaceId,
      usageSearches: field === "usageSearches" ? amount : 0,
      usageUploads: field === "usageUploads" ? amount : 0,
      usageMembers: field === "usageMembers" ? amount : 1,
      usageAI: field === "usageAI" ? amount : 0,
    },
  });
}
