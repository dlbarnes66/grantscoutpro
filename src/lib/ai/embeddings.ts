/**
 * Embedding utilities for text and documents.
 * This module restores BOTH embedText and createEmbedding,
 * because many parts of your AI pipeline depend on them.
 */

/**
 * Generates an embedding vector for text.
 * Replace with your actual embedding provider.
 */
export async function embedText(text: string): Promise<number[]> {
  // Placeholder — replace with your actual embedding model
  const fakeVector = Array(1536).fill(0).map(() => Math.random());
  return fakeVector;
}

/**
 * Creates an embedding suitable for saving into Prisma.
 * Returns BOTH:
 *   - vector: number[] (for similarity scoring)
 *   - bytes: Buffer (for Prisma Bytes column)
 */
export async function createEmbedding(text: string): Promise<{
  vector: number[];
  bytes: Buffer;
}> {
  const vector = await embedText(text);

  // Convert Float32Array → Buffer for Prisma Bytes
  const floatArray = new Float32Array(vector);
  const bytes = Buffer.from(floatArray.buffer);

  return { vector, bytes };
}
