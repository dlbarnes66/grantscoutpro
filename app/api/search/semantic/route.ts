import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, x, i) => sum + x * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, x) => sum + x * x, 0));
  const magB = Math.sqrt(b.reduce((sum, x) => sum + x * x, 0));
  return dot / (magA * magB);
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const embedding = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const queryVector = embedding.data[0].embedding;

    const grants = await prisma.grant.findMany({
      where: { embedding: { not: null } },
    });

    const ranked = grants
      .map((g) => ({
        ...g,
        score: cosineSimilarity(queryVector, g.embedding as number[]),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    return NextResponse.json({ results: ranked });
  } catch (err: any) {
    console.error("Semantic search error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
