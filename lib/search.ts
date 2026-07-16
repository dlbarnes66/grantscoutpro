import { prisma } from "@/lib/prisma";
import { generateEmbedding } from "@/lib/embeddings";

/**
 * Compute cosine similarity between two embedding vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

/**
 * Workspace-wide semantic search.
 * Returns ranked documents with match scores.
 */
export async function searchWorkspace(workspaceId: string, query: string) {
  // Generate embedding for the user's query
  const queryEmbedding = await generateEmbedding(query);

  if (!queryEmbedding || queryEmbedding.length === 0) {
    return [];
  }

  // Load all documents with embeddings in this workspace
  const documents = await prisma.document.findMany({
    where: {
      workspaceId,
      embedding: {
        isEmpty: false, // Correct Prisma filter for Float[] fields
      },
    },
    select: {
      id: true,
      title: true,
      summary: true,
      embedding: true,
      content: true,
    },
  });

  // Compute similarity scores
  const ranked = documents
    .map((doc) => {
      const score = cosineSimilarity(
        queryEmbedding,
        doc.embedding as number[]
      );

      return {
        ...doc,
        matchScore: score,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return ranked;
}
