import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const admin = await requireUser();
    const body = await req.json().catch(() => ({}));

    const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId.trim() : null;

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true }
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    const documents = await prisma.document.findMany({
      where: { workspaceId },
      select: { id: true, content: true }
    });

    for (const doc of documents) {
      const embeddingResponse = await fetch(process.env.EMBEDDING_ENDPOINT!, {
        method: "POST",
        body: JSON.stringify({ text: JSON.stringify(doc.content || {}) })
      }).then((r) => r.json());

      const vector = embeddingResponse.vector;
      const bytes = Buffer.from(JSON.stringify(vector));

      await prisma.documentEmbedding.upsert({
        where: { id: doc.id },
        update: {
          content: JSON.stringify(doc.content || {}),
          embedding: bytes,
          vector
        },
        create: {
          id: doc.id,
          documentId: doc.id,
          workspaceId,
          content: JSON.stringify(doc.content || {}),
          embedding: bytes,
          vector
        }
      });
    }

    await prisma.internalActivity.create({
      data: {
        adminId: admin.id,
        type: "reindex_workspace",
        description: `Workspace ${workspaceId} reindexed (${documents.length} documents)`
      }
    });

    return NextResponse.json({
      success: true,
      workspaceId,
      documentsReindexed: documents.length
    });
  } catch (error) {
    console.error("Reindex Workspace Error:", error);
    return NextResponse.json({ error: "Failed to reindex workspace." }, { status: 500 });
  }
}
