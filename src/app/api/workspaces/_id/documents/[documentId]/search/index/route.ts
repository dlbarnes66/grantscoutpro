import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

// Dummy embedding generator — replace with real provider
async function generateEmbedding(text: string): Promise<number[]> {
  return Array.from({ length: 1536 }, () => Math.random());
}

// Chunk text into manageable pieces
function chunkText(text: string, size = 500): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += size;
  }
  return chunks;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { _id: string; documentId: string } }
) {
  try {
    const user = await requireUser(req);
    const workspaceId = params._id;
    const documentId = params.documentId;

    if (!workspaceId || !documentId) {
      return NextResponse.json(
        { error: "workspaceId and documentId are required." },
        { status: 400 }
      );
    }

    // Ensure user is a workspace member
    const membership = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: user.id },
      select: { id: true }
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You do not have access to this workspace." },
        { status: 403 }
      );
    }

    // Fetch document
    const document = await prisma.workspaceDocument.findFirst({
      where: { id: documentId, workspaceId },
      select: {
        id: true,
        content: true
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    // Convert content to text
    const rawText =
      typeof document.content === "string"
        ? document.content
        : JSON.stringify(document.content);

    if (!rawText || rawText.length < 10) {
      return NextResponse.json(
        { error: "Not enough content to index." },
        { status: 400 }
      );
    }

    // Chunk text
    const chunks = chunkText(rawText);

    // Clear old embeddings
    await prisma.documentEmbedding.deleteMany({
      where: { documentId }
    });

    // Generate embeddings for each chunk
    const createdEmbeddings = [];

    for (const chunk of chunks) {
      const vector = await generateEmbedding(chunk);

      const emb = await prisma.documentEmbedding.create({
        data: {
          documentId,
          text: chunk,
          vector
        },
        select: {
          id: true,
          text: true
        }
      });

      createdEmbeddings.push(emb);
    }

    // Log activity
    await prisma.workspaceDocumentActivity.create({
      data: {
        documentId,
        userId: user.id,
        type: "search_index",
        description: "Document indexed for semantic search"
      }
    });

    return NextResponse.json(
      {
        success: true,
        chunksIndexed: createdEmbeddings.length
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Search Index error:", error);
    return NextResponse.json(
      { error: "Failed to index document." },
      { status: 500 }
    );
  }
}
