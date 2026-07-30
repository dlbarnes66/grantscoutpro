import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await context.params;

    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document || !document.embedding) {
      return NextResponse.json(
        { error: "Document or embedding missing" },
        { status: 400 }
      );
    }

    const grants = await prisma.grant.findMany();

    const scored = grants
      .filter((g) => Array.isArray(g.embedding) && g.embedding.length > 0)
      .map((grant) => {
        const score = cosineSimilarity(
          document.embedding as number[],
          grant.embedding as number[]
        );
        return { ...grant, matchScore: score };
      })
      .filter((g) => g.matchScore > 0.75)
      .sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      document,
      grants: scored
    });
  } catch (err: any) {
    console.error("MATCH GRANTS ROUTE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
