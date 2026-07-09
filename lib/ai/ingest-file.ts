import { prisma } from "@/lib/prisma";
import { extractFileContent } from "./file-extractor";
import { createEmbedding } from "./embeddings";

export async function ingestFile(workspaceId: string, file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Store file metadata + raw buffer
  const savedFile = await prisma.file.create({
    data: {
      workspaceId,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      raw: buffer,
    },
  });

  // Extract text
  const text = await extractFileContent(savedFile.id);

  // Embed text
  const vector = await createEmbedding(text);

  // Store embedding
  await prisma.documentEmbedding.create({
    data: {
      workspaceId,
      documentId: savedFile.id,
      documentTitle: savedFile.name,
      text,
      vector,
      score: 0,
    },
  });

  return {
    fileId: savedFile.id,
    textLength: text.length,
  };
}
