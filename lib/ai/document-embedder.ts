/**
 * Document + File embedding orchestrator.
 *
 * Responsibilities:
 * - Extract text from Document.content (JSON)
 * - Extract text from linked Files (PDF, DOCX, TXT, MD, HTML)
 * - Combine extracted text
 * - Generate embeddings
 * - Return clean vector + extracted text
 *
 * This module is used by:
 * - /api/embeddings/ingest
 * - /api/search/semantic
 * - /api/clustering/cluster
 * - /api/rag/answer
 */

import { prisma } from "@/lib/prisma";
import { extractContent } from "./content-extractor";
import { extractFileContent } from "./file-extractor";
import { createEmbedding } from "./embeddings";

/**
 * Extracts all text associated with a Document:
 * - JSON content (TipTap, Slate, Lexical, Quill, etc.)
 * - Linked files (PDF, DOCX, TXT, MD, HTML)
 */
export async function extractDocumentText(documentId: string): Promise<string> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      File: true, // Workspace/User/Document files
    },
  });

  if (!document) {
    throw new Error(`Document not found: ${documentId}`);
  }

  let textParts: string[] = [];

  // 1. Extract from Document.content (JSON)
  if (document.content) {
    const contentText = extractContent(document.content);
    if (contentText) textParts.push(contentText);
  }

  // 2. Extract from linked files
  if (document.File && document.File.length > 0) {
    for (const file of document.File) {
      try {
        const fileText = await extractFileContent(file.id);
        if (fileText) textParts.push(fileText);
      } catch (err) {
        console.error(`File extraction failed for ${file.id}:`, err);
      }
    }
  }

  // Combine all extracted text
  return textParts.join(" ").trim();
}

/**
 * Creates an embedding for a document:
 * - Extracts all text
 * - Generates embedding vector
 * - Returns both
 */
export async function embedDocument(documentId: string): Promise<{
  text: string;
  vector: number[];
}> {
  const text = await extractDocumentText(documentId);

  if (!text || text.trim().length === 0) {
    throw new Error(`Document ${documentId} contains no extractable text`);
  }

  const vector = await createEmbedding(text);

  return { text, vector };
}

/**
 * Creates an embedding for a file (standalone).
 */
export async function embedFile(fileId: string): Promise<{
  text: string;
  vector: number[];
}> {
  const text = await extractFileContent(fileId);

  if (!text || text.trim().length === 0) {
    throw new Error(`File ${fileId} contains no extractable text`);
  }

  const vector = await createEmbedding(text);

  return { text, vector };
}
