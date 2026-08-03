import { prisma } from "@/lib/prisma";
import { embedText } from "./embeddings";
import { cosineSimilarity } from "./similarity";

/**
 * Performs semantic search across document embeddings.
 */
export async function semanticSearch(workspaceId: string, query: string) {
  // 1. Embed the query
  const queryEmbedding = await embedText(query);

  // 2. Fetch all document embeddings
  const embeddings = await prisma.documentEmbedding.findMany({
    where: { workspaceId },
    include: { document: true }
  });

  // 3. Score each document
  const results = embeddings.map((e) => {
    const vector = new Float32Array(
      e.embedding.buffer,
      e.embedding.byteOffset,
      e.embedding.byteLength / 4
    );

    return {
      id: e.documentId,
      text: e.content || "",
      score: cosineSimilarity(queryEmbedding, Array.from(vector))
    };
  });

  // 4. Sort by relevance
  return results.sort((a, b) => b.score - a.score);
}
