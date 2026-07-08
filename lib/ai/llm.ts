/**
 * RAG answer generator using GPT-4o-mini.
 *
 * Responsibilities:
 * - Embed user question
 * - Rank workspace documents by similarity
 * - Select top relevant context
 * - Generate grounded answer
 */

import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { createEmbedding } from "./embeddings";
import { cosineSimilarity } from "./similarity";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Retrieves the top N most relevant documents for a question.
 */
async function getRelevantDocuments(
  workspaceId: string,
  questionEmbedding: number[],
  limit: number = 5
) {
  const docs = await prisma.documentEmbedding.findMany({
    where: { workspaceId },
    include: {
      document: true,
    },
  });

  const ranked = docs
    .map((d) => ({
      id: d.documentId,
      text: d.text,
      score: cosineSimilarity(questionEmbedding, d.vector),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ranked;
}

/**
 * Generates a grounded RAG answer.
 */
export async function generateRagAnswer(
  workspaceId: string,
  question: string
): Promise<{
  answer: string;
  sources: { id: string; score: number }[];
}> {
  if (!question || question.trim().length === 0) {
    throw new Error("RAG error: question cannot be empty");
  }

  // 1. Embed the question
  const questionEmbedding = await createEmbedding(question);

  // 2. Retrieve relevant documents
  const relevantDocs = await getRelevantDocuments(
    workspaceId,
    questionEmbedding
  );

  const contextText = relevantDocs
    .map((d, i) => `Source ${i + 1}:\n${d.text}`)
    .join("\n\n");

  // 3. Generate grounded answer
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI assistant. Answer using ONLY the provided context. If the answer is not in the context, say you don't know.",
      },
      {
        role: "user",
        content: `Context:\n${contextText}\n\nQuestion: ${question}`,
      },
    ],
  });

  const answer = response.choices[0].message.content || "";

  return {
    answer,
    sources: relevantDocs.map((d) => ({
      id: d.id,
      score: d.score,
    })),
  };
}
