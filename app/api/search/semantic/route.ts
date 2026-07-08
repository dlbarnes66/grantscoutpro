import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveContext } from "@/lib/ai/context-resolver";
import { createEmbedding } from "@/lib/ai/embeddings";
import { cosineSimilarity } from "@/lib/ai/similarity";

/**
 * Semantic search across workspace documents.
 *
 * Accepts:
 * {
 *   query: string
 *   limit?: number
 * }
 *
 * Returns:
 * - ranked documents
 * - similarity scores
 * - document metadata
 */

export async function POST(req: Request) {
  try {
    // 1. Resolve workspace + user
    const { workspaceId } = await resolveContext(req);

    const body = await req.json();
    const { query, limit = 10 } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query cannot be empty" },
        { status: 400 }
      );
    }

    // 2. Embed the query
    const queryEmbedding = await createEmbedding(query);

    // 3. Fetch all document embeddings in workspace
    const docs = await prisma.documentEmbedding.findMany({
      where: { workspaceId },
      include: {
        document: true,
      },
    });

    if (docs.length === 0) {
      return NextResponse.json({
        results: [],
        count: 0,
      });
    }

    // 4. Rank documents by cosine similarity
    const ranked = docs
      .map((d) => ({
        id: d.documentId,
        text: d.text,
        score: cosineSimilarity(queryEmbedding, d.vector),
        document: d.document,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return NextResponse.json({
      query,
      count: ranked.length,
      results: ranked.map((r) => ({
        id: r.id,
        score: r.score,
        title: r.document.title,
        updatedAt: r.document.updatedAt,
        textPreview: r.text.slice(0, 300),
      })),
    });
  } catch (err: any) {
    console.error("Semantic search error:", err);
    return NextResponse.json(
      { error: err.message || "Semantic search failed" },
      { status: 500 }
    );
  }
}
