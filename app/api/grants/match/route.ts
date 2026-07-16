import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateEmbedding } from "@/lib/embeddings";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.workspaceId) {
      return NextResponse.json(
        { error: "Unauthorized: No workspace found in session" },
        { status: 401 }
      );
    }

    const workspaceId = session.user.workspaceId;
    const { organizationType, projectDescription, location, budget } =
      await req.json();

    if (!organizationType || !projectDescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Build a combined query for matching
    const combinedQuery = `
      Organization Type: ${organizationType}
      Location: ${location || "N/A"}
      Budget: ${budget || "N/A"}
      Project Description: ${projectDescription}
    `;

    const queryEmbedding = await generateEmbedding(combinedQuery);

    // Load workspace documents (correct model)
    const documents = await prisma.workspaceDocument.findMany({
      where: { workspaceId },
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        embedding: true,
      },
    });

    // Compute similarity scores
    const ranked = documents
      .map((doc) => {
        const score = cosineSimilarity(
          queryEmbedding,
          doc.embedding as number[]
        );

        return {
          id: doc.id,
          title: doc.title,
          summary: doc.summary,
          score,
        };
      })
      .sort((a, b) => b.score - a.score);

    return NextResponse.json({
      ok: true,
      results: ranked,
    });
  } catch (err) {
    console.error("Grant matching error:", err);
    return NextResponse.json(
      { error: "Failed to match grants" },
      { status: 500 }
    );
  }
}

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}
