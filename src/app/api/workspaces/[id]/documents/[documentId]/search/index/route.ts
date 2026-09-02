import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

// Dummy embedding generator — replace with real provider
async function generateEmbedding(
  text: string
): Promise<number[]> {
  return Array.from(
    { length: 1536 },
    () => Math.random()
  );
}

// Chunk text into manageable pieces
function chunkText(
  text: string,
  size = 500
): string[] {
  const chunks: string[] = [];

  let i = 0;

  while (i < text.length) {
    chunks.push(
      text.slice(i, i + size)
    );

    i += size;
  }

  return chunks;
}

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      _id: string;
      documentId: string;
    };
  }
) {
  try {
    const user = await requireUser();

    const workspaceId = params._id;
    const documentId =
      params.documentId;

    if (
      !workspaceId ||
      !documentId
    ) {
      return NextResponse.json(
        {
          error:
            "workspaceId and documentId are required.",
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

    const document =
      await prisma.workspaceDocument.findFirst({
        where: {
          id: documentId,
          workspaceId,
        },
        select: {
          id: true,
          content: true,
        },
      });

    if (!document) {
      return NextResponse.json(
        {
          error:
            "Document not found.",
        },
        {
          status: 404,
        }
      );
    }

    const rawText =
      typeof document.content ===
      "string"
        ? document.content
        : JSON.stringify(
            document.content
          );

    if (
      !rawText ||
      rawText.length < 10
    ) {
      return NextResponse.json(
        {
          error:
            "Not enough content to index.",
        },
        {
          status: 400,
        }
      );
    }

    const chunks =
      chunkText(rawText);

    await prisma.documentEmbedding.deleteMany(
      {
        where: {
          documentId,
        },
      }
    );

    const createdEmbeddings =
      [];

    for (const chunk of chunks) {
      const vector =
        await generateEmbedding(
          chunk
        );

      const embedding =
        await prisma.documentEmbedding.create(
          {
            data: {
              documentId,
              workspaceId,
              content: chunk,
              vector,
              embedding:
                Buffer.from(""),
            },
            select: {
              id: true,
              content: true,
            },
          }
        );

      createdEmbeddings.push(
        embedding
      );
    }

    return NextResponse.json(
      {
        success: true,
        chunksIndexed:
          createdEmbeddings.length,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Search Index error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to index document.",
      },
      {
        status: 500,
      }
    );
  }
}