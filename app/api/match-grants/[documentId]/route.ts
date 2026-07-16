import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { generateEmbedding } from "@/lib/embeddings";

export async function GET(
  _req: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = session.user.workspaceId;
    const documentId = params.documentId;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || !document.content) {
      return NextResponse.json(
        { error: "Document not found or has no content" },
        { status: 404 }
      );
    }

    const text =
      typeof document.content === "string"
        ? document.content
        : JSON.stringify(document.content);

    const docEmbedding = await generateEmbedding(text);

    const grants = await prisma.grant.findMany({
      where: { workspaceId },
      select: {
        id: true,
        title: true,
        summary: true,
        amount: true,
        deadline: true,
        embedding: true,
      },
    });

    const results = grants
      .map((grant) => {
        const score = cosineSimilarity(
          docEmbedding,
          grant.embedding ?? []
        );

        return {
          id: grant.id,
          title: grant.title,
          summary: grant.summary,
          amount: grant.amount,
          deadline: grant.deadline,
          score,
        };
      })
      .sort((a, b) => b.score - a.score);

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error("Match grants error:", err);
    return NextResponse.json(
      { error: "Failed to match grants" },
      { status: 500 }
    );
  }
}

function cosineSimilarity(a: number[], b: number[]) {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}
