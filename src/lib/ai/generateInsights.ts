import { prisma } from "@/lib/prisma";

/**
 * Generates workspace insights based on recent search analytics.
 */
export async function generateInsights(workspaceId: string) {
  const analytics = await prisma.searchAnalytics.findMany({
    where: { workspaceId },
    orderBy: { resultCount: "desc" },
    take: 20,
  });

  if (analytics.length === 0) return [];

  return analytics.map((entry) => ({
    query: entry.query,
    resultCount: entry.resultCount,
    durationMs: entry.durationMs,
    createdAt: entry.createdAt,
  }));
}
