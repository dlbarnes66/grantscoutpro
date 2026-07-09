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
      usageMembers: 1,
      periodStart: new Date(),
    },
  });
}
