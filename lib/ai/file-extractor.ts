import { prisma } from "@/lib/prisma";

/**
 * Extracts text content from a file using its FileEmbedding record.
 * The File model does NOT contain a `text` field.
 *
 * Export name restored to `extractFileContent` because
 * other modules depend on that name.
 */
export async function extractFileContent(fileId: string): Promise<string> {
  const embedding = await prisma.fileEmbedding.findUnique({
    where: { fileId }
  });

  if (!embedding) return "";

  return embedding.text || "";
}
