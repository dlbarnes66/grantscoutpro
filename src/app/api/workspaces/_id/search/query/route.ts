import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

async function generateEmbedding(
  text: string
): Promise<number[]> {
  return Array.from(
    { length: 1536 },
    () => Math.random()
  );
}

function cosineSimilarity(
  a: number[],
  b: number[]
): number {
  const dot = a.reduce(
    (sum, v, i) => sum + v * (b[i] ?? 0),
    0
  );

  const magA = Math.sqrt(
    a.reduce((sum, v) => sum + v * v, 0)
  );

  const magB = Math.sqrt(
    b.reduce((sum, v) => sum + v * v, 0)
  );

  if (!magA || !magB) {
    return 0;
  }

  return dot / (magA * magB);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { _id: string } }
) {
  try {
    const user = await requireUser();

    const workspaceId = params._id;

    const body = await req
      .json()
      .catch(() => ({}));

    const query =
      typeof body.query === "string"
        ? body.query.trim()
        : "";

    if (!workspaceId) {
      return NextResponse.json(
        {
          error: "workspaceId is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (query.length < 2) {
      return NextResponse.json(
        {
          error:
            "query is required and must be at least 2 characters.",
        },
        {
          status: 400,
        }
      );
    }

    const membership =
      await prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId: user.id,
        },
        select: {
          id: true,
        },
      });

    if (!membership) {
      return NextResponse.json(
        {
          error:
            "You do not have access to this workspace.",
        },
        {
          status: 403,
        }
      );
    }

    const queryVector =
      await generateEmbedding(query);

    const embeddings =
      await prisma.documentEmbedding.findMany({
        where: {
          workspaceId,
        },
        select: {
          id: true,
          content: true,
          vector: true,
          documentId: true,
          document: {
            select: {
              title: true,
              updatedAt: true,
            },
          },
        },
      });

    const semanticRanked = embeddings
      .map((emb) => ({
        documentId: emb.documentId,
        documentName:
          emb.document.title,
        updatedAt:
          emb.document.updatedAt,
        snippet: emb.content,
        score: cosineSimilarity(
          queryVector,
          emb.vector
        ),
      }))
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .slice(0, 20);

    const keywordMatches = embeddings
      .filter((emb) =>
        emb.content
          .toLowerCase()
          .includes(
            query.toLowerCase()
          )
      )
      .map((emb) => ({
        documentId: emb.documentId,
        documentName:
          emb.document.title,
        updatedAt:
          emb.document.updatedAt,
        snippet: emb.content,
        score: 0.75,
      }));

    const combined = [
      ...semanticRanked,
      ...keywordMatches,
    ].reduce(
      (
        acc,
        item
      ) => {
        const key = `${item.documentId}-${item.snippet}`;

        if (!acc.has(key)) {
          acc.set(key, item);
        }

        return acc;
      },
      new Map<string, any>()
    );

    const results = Array.from(
      combined.values()
    ).sort(
      (a, b) =>
        b.score - a.score
    );

    return NextResponse.json(
      {
        query,
        count: results.length,
        results,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Search Query error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to perform search.",
      },
      {
        status: 500,
      }
    );
  }
}