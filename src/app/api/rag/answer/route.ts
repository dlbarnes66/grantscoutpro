export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { resolveContext } from "@/lib/ai/context-resolver";
import { createEmbedding } from "@/lib/ai/embeddings";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const ctx = await resolveContext();

    if (!ctx?.workspaceId || !ctx?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized or missing workspace" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { question } = body;

    if (!question) {
      return NextResponse.json(
        { error: "Missing question" },
        { status: 400 }
      );
    }

    const embedding = await createEmbedding(question);

    await prisma.embedding.create({
      data: {
        workspaceId: ctx.workspaceId,
        userId: ctx.user.id,
        vector: embedding.vector
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
