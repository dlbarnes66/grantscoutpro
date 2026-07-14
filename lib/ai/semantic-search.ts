import { prisma } from "@/lib/prisma";
import { embedText } from "./document-embedder";

// This version matches rag-chat.ts perfectly
export async function semanticSearch({
  workspaceId,
  query,
}: {
  workspaceId: string;
  query: string;
}) {
  // 1. Embed the query
  const queryEmbedding = await embedText(query);

  // 2. Search embeddings in this workspace
  const results = await prisma.workspaceEmbedding.findMany({
    where: { workspaceId },
    select: {
      id: true,
      documentId: true,
      content: true,
      embedding: true,
      documentTitle: true, // add this if your rag-chat expects it
      snippet: true,       // add this if your rag-chat expects it
    },
  });

  // 3. Compute similarity scores
  const scored = results.map((item) => {
    const score = cosineSimilarity(queryEmbedding, item.embedding);
    return { ...item, score };
  });

  // 4. Sort by score
  scored.sort((a, b) => b.score - a.score);

  // 5. Return in the shape rag-chat expects
  return {
    results: scored.slice(0, 10),
  };
}

// Simple cosine similarity
function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}
