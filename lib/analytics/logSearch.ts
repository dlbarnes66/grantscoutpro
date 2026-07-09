import { prisma } from "@/lib/prisma";

export async function logSearch(workspaceId: string, query: string) {
  const existing = await prisma.searchAnalytics.findFirst({
    where: { workspaceId, query },
  });

  if (existing) {
    return prisma.searchAnalytics.update({
      where: { id: existing.id },
      data: {
        count: existing.count + 1,
        lastSearchedAt: new Date(),
      },
    });
  }

  return prisma.searchAnalytics.create({
    data: {
      workspaceId,
      query,
    },
  });
}
