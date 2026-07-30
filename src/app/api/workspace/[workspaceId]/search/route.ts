import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { queryVector } = body;

    if (!Array.isArray(queryVector)) {
      return NextResponse.json(
        { error: "queryVector must be an array of numbers" },
        { status: 400 }
      );
    }

    const embeddings = await prisma.workspaceEmbedding.findMany({
      where: { workspaceId }
    });

    const results = embeddings
      .map((emb) => ({
        id: emb.id,
        text: emb.text,
        score: cosineSimilarity(queryVector, emb.vector)
      }))
      .filter((r) => r.score > 0.75)
      .sort((a, b) => b.score - a.score);

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error("WORKSPACE SEARCH ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
