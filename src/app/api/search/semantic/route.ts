export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";



// Local cosine similarity implementation
function cosineSimilarity(a: number[], b: number[]) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { queryEmbedding } = await req.json();

    if (!Array.isArray(queryEmbedding)) {
      return NextResponse.json(
        { error: "Invalid embedding" },
        { status: 400 }
      );
    }

    // Resolve workspace (owner or member)
    let workspace = await prisma.workspace.findFirst({
      where: { ownerId: userId },
    });

    if (!workspace) {
      const membership = await prisma.workspaceMember.findFirst({
        where: { userId },
        include: { workspace: true },
      });

      workspace = membership?.workspace ?? null;
    }

    if (!workspace) {
      return NextResponse.json(
        { error: "No workspace found for user" },
        { status: 404 }
      );
    }

    // Fetch documents in this workspace (embedding stored on Document)
    const documents = await prisma.document.findMany({
      where: { workspaceId: workspace.id },
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        embedding: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Compute similarity scores
    const results = documents
      .map((doc) => ({
        id: doc.id,
        score: cosineSimilarity(queryEmbedding, doc.embedding ?? []),
        document: doc,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (err: any) {
    console.error("SEMANTIC SEARCH ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
