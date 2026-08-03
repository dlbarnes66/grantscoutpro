import { prisma } from "@/lib/prisma";

type UsageType = "searches" | "uploads" | "ai" | "members";

export async function incrementUsage(workspaceId: string, type: UsageType) {
  const fieldMap = {
    searches: "usageSearches",
    uploads: "usageUploads",
    ai: "usageAI",
    members: "usageMembers",
  } as const;

  const field = fieldMap[type];

  return prisma.workspaceBilling.update({
    where: { workspaceId },
    data: {
      [field]: { increment: 1 },
    },
  });
}
