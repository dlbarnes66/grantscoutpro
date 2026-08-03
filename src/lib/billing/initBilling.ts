import { prisma } from "@/lib/prisma";

export async function initBilling(workspaceId: string) {
  const existing = await prisma.workspaceBilling.findUnique({
    where: { workspaceId },
  });

  if (existing) return existing;

  return prisma.workspaceBilling.create({
    data: {
      workspaceId,
      plan: "free",
      usageSearches: 0,
      usageUploads: 0,
      usageAI: 0,
      usageMembers: 1,
      periodStart: new Date(),
    },
  });
}
