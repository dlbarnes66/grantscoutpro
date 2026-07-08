import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createEmbedding } from "@/lib/ai/embeddings";

async function getContext() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: true },
  });

  if (!membership || !membership.workspace) {
    throw new Error("No active workspace");
  }

  return {
    userId,
    workspaceId: membership.workspace.id,
  };
}

export async function POST(req: Request) {
  try {
    const { userId, workspaceId } = await getContext();

    const body = await req.json();
    const { documentId, text } = body as {
      documentId?: string;
      text: string;
    };

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required to create embeddings" },
        { status: 400 }
      );
    }

    const vector = await createEmbedding(text);

    const embedding = await prisma.embedding.create({
      data: {
        workspaceId,
        userId,
        documentId: documentId ?? null,
        vector,
      },
    });

    return NextResponse.json({ embedding });
  } catch (error: any) {
    console.error("Embedding ingest error:", error);
    return NextResponse.json(
      { error: error.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
