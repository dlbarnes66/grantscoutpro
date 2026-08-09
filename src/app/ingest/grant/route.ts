import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeGrant } from "@/lib/ingest/normalizeGrant";
import { dedupeGrant } from "@/lib/ingest/dedupeGrant";
import { runGrantAI } from "@/lib/ingest/runGrantAI";
import { generateGrantEmbedding } from "@/lib/ingest/generateGrantEmbedding";

export async function POST(req: NextRequest, context: { params: Record<string, string> }) {
  const { params } = context;
  try {
    const body = await req.json();

    const normalized = normalizeGrant(body);
    const deduped = await dedupeGrant(normalized as any);
    const ai = await runGrantAI(deduped as any);
    const embedding = await generateGrantEmbedding(deduped as any);

    const saved = await prisma.grant.create({
      data: {
        ...deduped,
        aiSummary: ai.aiSummary,
        embedding,
      },
    });

    return NextResponse.json(saved);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Grant ingest failed" },
      { status: 500 }
    );
  }
}
