import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Convert numeric embedding vector → Buffer (required by Prisma Bytes)
export function embeddingToBytes(vector: number[]): Buffer {
  const floatArray = new Float32Array(vector);
  return Buffer.from(floatArray.buffer);
}

// Generate embeddings and store them for a document
export async function embedDocument(
  workspaceId: string,
  documentId: string,
  content: string
) {
  const chunks = chunkText(content, 1000);

  for (const chunk of chunks) {
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunk,
    });

    const vector = embeddingResponse.data[0]?.embedding || [];
    const bytes = embeddingToBytes(vector);

    await prisma.documentEmbedding.create({
      data: {
        workspaceId,
        documentId,
        content: chunk,
        embedding: bytes,
      },
    });
  }
}

// Helper: chunk text into ~maxLength characters
function chunkText(text: string, maxLength: number): string[] {
  const result: string[] = [];
  let current = "";

  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    if ((current + sentence).length > maxLength) {
      if (current) result.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }

  if (current) result.push(current);
  return result;
}
