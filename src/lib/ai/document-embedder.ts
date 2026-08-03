import { prisma } from "@/lib/prisma";
import { extractContent } from "./content-extractor";
import { extractFileContent } from "./file-extractor";
import { createEmbedding } from "./embeddings";

/**
 * Extracts text from a document or its attached files and generates embeddings.
 */
export async function embedDocument(documentId: string, workspaceId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: { File: true }
  });

  if (!doc) return null;

  // 1. Extract text from document content
  let text = "";

  if (doc.content) {
    text = extractContent(doc.content);
  }

  // 2. If no text, try first attached file
  if (!text && doc.File.length > 0) {
    const file = doc.File[0];
    text = await extractFileContent(file.id);
  }

  if (!text) text = "";

  // 3. Create embedding (vector + bytes)
  const embedding = await createEmbedding(text);

  // 4. Store embedding in Prisma
  const result = await prisma.documentEmbedding.create({
    data: {
      documentId,
      workspaceId,
      content: text,
      embedding: embedding.bytes
    }
  });

  return {
    id: result.id,
    text,
    vector: embedding.vector
  };
}

/**
 * Generates an embedding for raw text (used by semantic search).
 */
export async function embedTextContent(text: string) {
  const embedding = await createEmbedding(text);

  return {
    text,
    vector: embedding.vector,
    bytes: embedding.bytes
  };
}
