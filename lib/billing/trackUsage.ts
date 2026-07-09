import { prisma } from "@/lib/prisma";

export async function trackUsage(
  workspaceId: string,
  type: "search" | "upload" | "member" | "ai"
) {
  const billing = await prisma.workspaceBilling.findUnique({
    where: { workspaceId },
  });

  if (!billing) return;

  switch (type) {
    case "search":
      return prisma.workspaceBilling.update({
        where: { workspaceId },
        data: { usageSearches: billing.usageSearches + 1 },
      });

    case "upload":
      return prisma.workspaceBilling.update({
        where: { workspaceId },
        data: { usageUploads: billing.usageUploads + 1 },
      });

    case "member":
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
