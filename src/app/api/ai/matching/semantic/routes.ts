import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grants, profile } = await req.json();

    if (!grants || !profile) {
      return NextResponse.json({ error: "Missing grants or profile" }, { status: 400 });
    }

    const response = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: JSON.stringify(profile)
    });

    const profileEmbedding = response.data[0].embedding;

    const results = [];

    for (const grant of grants) {
      const grantEmbeddingRes = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: JSON.stringify(grant)
      });

      const grantEmbedding = grantEmbeddingRes.data[0].embedding;

      // Cosine similarity
      const dot = profileEmbedding.reduce((sum, v, i) => sum + v * grantEmbedding[i], 0);
      const magA = Math.sqrt(profileEmbedding.reduce((sum, v) => sum + v * v, 0));
      const magB = Math.sqrt(grantEmbedding.reduce((sum, v) => sum + v * v, 0));
      const similarity = dot / (magA * magB);

      results.push({
        grantId: grant.id,
        similarity
      });
    }

    return NextResponse.json({ matches: results });
  } catch (err: any) {
    console.error("Semantic matching error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
