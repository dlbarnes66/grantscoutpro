import { prisma } from "@/lib/prisma";

export async function keywordSearch(q: string, where: any) {
  const query = q.trim();
  if (!query) return [];

  // Remove undefined values from `where`
  const cleanWhere = Object.fromEntries(
    Object.entries(where || {}).filter(([_, v]) => v !== undefined)
  );

  const grants = await prisma.grant.findMany({
    where: {
      ...cleanWhere,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { agency: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
        { industry: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { deadline: "asc" },
    take: 200,
  });

  return grants.map((g) => ({
    id: g.id,
    title: g.title,
    summary: g.summary,
    agency: g.agency,
    category: g.category,
    amount: g.amount,
    deadline: g.deadline,
    status: g.status,
    aiEligibilityScore: g.aiEligibilityScore,
    aiAlignmentScore: g.aiAlignmentScore,
    score: 1.0,
  }));
}
