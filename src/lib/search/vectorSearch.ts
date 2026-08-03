import { prisma } from "@/lib/prisma";

function mockQueryEmbedding(q: string): number[] {
  // Replace with real embedding model later
  return Array.from({ length: 128 }).map(() => Math.random() * 2 - 1);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (!normA || !normB) return 0;

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function vectorSearch(q: string, where: any) {
  const queryEmbedding = mockQueryEmbedding(q);

  const grants = await prisma.grant.findMany({
    where: {
      ...where,
      // embedding is always an array, never null
    },
    take: 500,
  });

  const scored = grants
    .map((g) => {
      const sim = cosineSimilarity(
        queryEmbedding,
        (g.embedding as number[]) || []
      );

      return {
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
        score: sim,
      };
    })
    .sort((a, b) => b.score - a.score);

  return scored;
}
