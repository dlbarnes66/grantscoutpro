import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { embeddingToBytes } from "@/lib/embeddings";

// -----------------------------
// OpenAI Client
// -----------------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// -----------------------------
// Generate embedding for the search query
// -----------------------------
async function generateQueryEmbedding(query: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });

  return response.data[0].embedding;
}

// -----------------------------
// Semantic Search
// -----------------------------
export async function semanticSearch(workspaceId: string, query: string) {
  // 1. Embed the user's search query
  const queryEmbedding = await generateQueryEmbedding(query);
  const queryBytes = embeddingToBytes(queryEmbedding);

  // 2. Run pgvector similarity search using raw SQL
  const results = await prisma.$queryRawUnsafe(`
    SELECT 
      id,
      documentId,
      workspaceId,
      content,
      embedding,
      createdAt,
      (embedding <-> $1::bytea) AS distance
    FROM "DocumentEmbedding"
    WHERE "workspaceId" = $2
    ORDER BY embedding <-> $1::bytea
    LIMIT 10;
  `, queryBytes, workspaceId);

  return results;
}
