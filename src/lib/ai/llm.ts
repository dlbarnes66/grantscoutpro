import { prisma } from "@/lib/prisma";
import { cosineSimilarity } from "./similarity";
import { embedText } from "./embeddings";

/**
 * Convert Prisma Bytes → Float[] for similarity scoring.
 */
function decodeEmbedding(bytes: Buffer): number[] {
  const floatArray = new Float32Array(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength / 4
  );
  return Array.from(floatArray);
}

/**
 * Retrieves relevant document embeddings and scores them.
 */
export async function getRelevantDocuments(
  workspaceId: string,
  questionEmbedding: number[]
) {
  const embeddings = await prisma.documentEmbedding.findMany({
    where: { workspaceId },
    include: {
      document: true
    }
  });

  return embeddings
    .map((d) => {
      const vector = decodeEmbedding(d.embedding);

      return {
        id: d.documentId,
        text: d.content || "",
        score: cosineSimilarity(questionEmbedding, vector)
      };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Basic LLM completion wrapper.
 * Replace with your actual LLM provider.
 */
export async function generateCompletion(prompt: string): Promise<string> {
  return `LLM Response: ${prompt}`;
}

/**
 * Full RAG answer generator.
 * Returns { answer, sources } instead of a raw string.
 */
export async function generateRagAnswer(
  workspaceId: string,
  question: string
): Promise<{ answer: string; sources: { id: string; text: string }[] }> {
  // 1. Embed the question
  const questionEmbedding = await embedText(question);

  // 2. Retrieve relevant documents
  const docs = await getRelevantDocuments(workspaceId, questionEmbedding);

  const topDocs = docs.slice(0, 5);

  // 3. Build context block
  const context = topDocs
    .map((d) => `Document ${d.id}:\n${d.text}`)
    .join("\n\n");

  // 4. Build final prompt
  const prompt = `
You are an AI assistant answering a question using workspace documents.

Question:
${question}

Relevant Context:
${context}

Answer clearly and concisely:
`;

  // 5. Generate completion
  const answer = await generateCompletion(prompt);

  return {
    answer,
    sources: topDocs.map((d) => ({
      id: d.id,
      text: d.text
    }))
  };
}
