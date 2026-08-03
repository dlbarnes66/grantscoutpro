import { prisma } from "@/lib/prisma";

/**
 * Logs a search event for analytics.
 */
export async function logSearch(
  workspaceId: string,
  query: string,
  resultCount: number,
  durationMs: number
) {
  // Check if an analytics record already exists for this query
  const existing = await prisma.searchAnalytics.findFirst({
    where: { workspaceId, query }
  });

  if (existing) {
    // Update existing record
    await prisma.searchAnalytics.update({
      where: { id: existing.id },
      data: {
        resultCount: existing.resultCount + resultCount,
        durationMs
      }
    });

    return;
  }

  // Create new analytics record
  await prisma.searchAnalytics.create({
    data: {
      workspaceId,
      query,
      resultCount,
      durationMs
    }
  });
}
