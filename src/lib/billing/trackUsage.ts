import { prisma } from "@/lib/prisma";

/**
 * Track usage for a workspace.
 * Types: "search", "upload", "ai", "member"
 */
export async function trackUsage(
  workspaceId: string,
  type: "search" | "upload" | "ai" | "member"
) {
  const fieldMap = {
    search: "usageSearches",
    upload: "usageUploads",
    ai: "usageAI",
    member: "usageMembers",
  };

  const field = fieldMap[type];

  await prisma.workspaceBilling.update({
    where: { workspaceId },
    data: {
      [field]: { increment: 1 },
    },
  });
}
