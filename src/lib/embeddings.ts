import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Generate an embedding vector for any text input.
 * This powers semantic search, summaries, related grants, etc.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    return [];
  }

  try {
    const response = await client.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("❌ Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}

/**
 * Generate embeddings for multiple documents at once.
 * Useful for batch processing or re-indexing.
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  try {
    const response = await client.embeddings.create({
      model: "text-embedding-3-large",
      input: texts,
    });

    return response.data.map((item) => item.embedding);
  } catch (error) {
    console.error("❌ Error generating batch embeddings:", error);
    throw new Error("Failed to generate batch embeddings");
  }
}

/**
 * Alias for document embedding — routes expect this name.
 * This keeps your API stable without changing route code.
 */
export async function embedDocument(content: string): Promise<number[]> {
  return generateEmbedding(content);
}
