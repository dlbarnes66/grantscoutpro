import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const admin = await requireUser();
    const body = await req.json().catch(() => ({}));

    const documentId = typeof body.documentId === "string" ? body.documentId.trim() : null;

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required." }, { status: 400 });
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, workspaceId: true, content: true }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    // Generate embedding
    const embeddingResponse = await fetch(process.env.EMBEDDING_ENDPOINT!, {
      method: "POST",
      body: JSON.stringify({ text: JSON.stringify(document.content || {}) })
    }).then((r) => r.json());

    const vector = embeddingResponse.vector;
    const bytes = Buffer.from(JSON.stringify(vector));

    // Upsert embedding
    await prisma.documentEmbedding.upsert({
      where: { id: documentId }, // You MUST use id, not documentId
      update: {
        content: JSON.stringify(document.content || {}),
        embedding: bytes,
        vector
      },
      create: {
        id: documentId,
        documentId,
        workspaceId: document.workspaceId!,
        content: JSON.stringify(document.content || {}),
        embedding: bytes,
        vector
      }
    });

    await prisma.internalActivity.create({
      data: {
        adminId: admin.id,
        type: "reindex_document",
        description: `Document ${documentId} reindexed`
      }
    });

    return NextResponse.json({
      success: true,
      documentId,
      vectorLength: vector.length
    });
  } catch (error) {
    console.error("Reindex Document Error:", error);
    return NextResponse.json({ error: "Failed to reindex document." }, { status: 500 });
  }
}
