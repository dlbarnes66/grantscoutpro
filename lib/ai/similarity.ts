/**
 * Cosine similarity between two embedding vectors.
 *
 * Used for:
 * - Semantic search ranking
 * - RAG context ranking
 * - Clustering scoring
 *
 * Always returns a number between -1 and 1.
 */

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    throw new Error("Cosine similarity error: inputs must be arrays");
  }

  if (a.length !== b.length) {
    throw new Error("Cosine similarity error: vectors must have equal length");
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];

    dot += x * y;
    normA += x * x;
    normB += y * y;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
