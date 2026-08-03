import { prisma } from "@/lib/prisma";
import { extractFileContent } from "./file-extractor";

/**
 * Ingests a file into the workspace.
 * Stores metadata in the File model and extracted text in FileEmbedding.
 */
export async function ingestFile(
  workspaceId: string,
  file: {
    name: string;
    type: string;
    size: number;
    url: string;
    storage: string;
    id: string;
  }
) {
  // 1. Create File record
  const created = await prisma.file.create({
    data: {
      workspaceId,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      url: file.url,
      storage: file.storage
    }
  });

  // 2. Extract text content
  const text = await extractFileContent(created.id);

  // 3. Store embedding text
  await prisma.fileEmbedding.create({
    data: {
      fileId: created.id,
      workspaceId,
      text,
      vector: [] // embedding vector will be added later
    }
  });

  return created;
}
