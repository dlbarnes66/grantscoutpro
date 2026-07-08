import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveContext } from "@/lib/ai/context-resolver";
import { embedDocument, embedFile } from "@/lib/ai/document-embedder";

/**
 * Ingests a document or file into the AI system.
 *
 * Accepts:
 * {
 *   documentId?: string
 *   fileId?: string
 * }
 *
 * Returns:
 * - text extracted
 * - embedding vector
 * - stored embedding record
 */

export async function POST(req: Request) {
  try {
    // 1. Resolve workspace + user
    const { workspaceId } = await resolveContext(req);

    const body = await req.json();
    const { documentId, fileId } = body;

    if (!documentId && !fileId) {
      return NextResponse.json(
        { error: "Must provide either documentId or fileId" },
        { status: 400 }
      );
    }

    // 2. Embed document
    if (documentId) {
      const { text, vector } = await embedDocument(documentId);

      const record = await prisma.documentEmbedding.upsert({
        where: { documentId },
        update: {
          text,
          vector,
          workspaceId,
        },
        create: {
          documentId,
          text,
          vector,
          workspaceId,
        },
      });

      return NextResponse.json({
        type: "document",
        documentId,
        text,
        vector,
        embeddingId: record.id,
      });
    }

    // 3. Embed file
    if (fileId) {
      const { text, vector } = await embedFile(fileId);

      const record = await prisma.fileEmbedding.upsert({
        where: { fileId },
        update: {
          text,
          vector,
          workspaceId,
        },
        create: {
          fileId,
          text,
          vector,
          workspaceId,
        },
      });

      return NextResponse.json({
        type: "file",
        fileId,
        text,
        vector,
        embeddingId: record.id,
      });
    }
  } catch (err: any) {
    console.error("Embedding ingestion error:", err);
    return NextResponse.json(
      { error: err.message || "Embedding ingestion failed" },
      { status: 500 }
    );
  }
}
