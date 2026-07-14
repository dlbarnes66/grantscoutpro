import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { workspaceId, documentId, fileId, text, vector } = body;

  const embedding = await prisma.embedding.create({
    data: {
      workspaceId,
      documentId,
      userId: body.userId ?? null,
      vector,
      GrantPage: undefined,
    },
  });

  return NextResponse.json(embedding);
}
