/**
 * OpenAI embedding wrapper.
 *
 * Used for:
 * - Document embeddings
 * - File embeddings
 * - Semantic search queries
 * - Clustering vectors
 * - RAG question embeddings
 *
 * Always returns a clean Float[] vector.
 */

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Creates an embedding for any text input.
 */
export async function createEmbedding(text: string): Promise<number[]> {
  if (!text || typeof text !== "string") {
    throw new Error("Embedding error: input text must be a non-empty string");
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Embedding error: cannot embed empty text");
  }

  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: trimmed,
  });

  const [item] = response.data;

  if (!item || !item.embedding) {
    throw new Error("Embedding error: OpenAI returned no embedding");
  }

  return item.embedding;
}
