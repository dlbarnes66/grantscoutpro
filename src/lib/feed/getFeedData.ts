import { prisma } from "@/lib/prisma";
import { calcMatchScore } from "@/lib/matching/calcMatchScore";

export async function getFeedData({
  workspaceId,
  userId,
}: {
  workspaceId: string | null;
  userId: string | null;
}) {
  // 1. New grants (last 7 days)
  const newGrants = await prisma.grant.findMany({
    where: {
      postedDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { postedDate: "desc" },
    take: 20,
  });

  // 2. Trending grants (fallback: recently updated)
  const trending = await prisma.grant.findMany({
    where: {},
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  // 3. Workspace grants
  const workspaceGrants = workspaceId
    ? await prisma.grant.findMany({
        where: { workspaceId },
        orderBy: { updatedAt: "desc" },
        take: 20,
      })
    : [];

  // 4. Saved grants
  const savedGrants = userId
    ? await prisma.savedGrant.findMany({
        where: { userId },
        include: { grant: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  // 5. Recommended grants (AI + matching)
  const allGrants = await prisma.grant.findMany({
    where: {},
    take: 200,
  });

  const recommended = [];

  for (const g of allGrants) {
    const score = await calcMatchScore(g, userId, workspaceId);
    if (score > 0.5) {
      recommended.push({ ...g, matchScore: score });
    }
  }

  recommended.sort((a, b) => b.matchScore - a.matchScore);

  return {
    newGrants,
    trending,
    workspaceGrants,
    savedGrants: savedGrants.map((s) => s.grant),
    recommended,
  };
}
