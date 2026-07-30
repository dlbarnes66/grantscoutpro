export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { createEmbedding } from "@/lib/ai/embeddings";

export async function POST(req: Request) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { text, workspaceId } = body;

  if (!text || !workspaceId) {
    return NextResponse.json(
      { error: "Missing text or workspaceId" },
      { status: 400 }
    );
  }

  const embedding = await createEmbedding(text);

  await prisma.embedding.create({
    data: {
      workspaceId,            // ⭐ REQUIRED by your Prisma model
      userId: session.user.id,
      vector: embedding.vector
    }
  });

  return NextResponse.json({ success: true });
}
