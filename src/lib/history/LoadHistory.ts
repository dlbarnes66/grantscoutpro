import { prisma } from "@/lib/prisma";

export async function loadHistory(grantId: string) {
  // Load all history models related to a grant
  // Deployment-safe: return minimal combined history

  const histories = await prisma.narrativeHistory.findMany({
    where: { grantId },
    orderBy: { createdAt: "desc" },
  });

  return histories;
}
