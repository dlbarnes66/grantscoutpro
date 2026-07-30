export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grants, profile } = await req.json();

    if (!grants || !profile) {
      return NextResponse.json({ error: "Missing grants or profile" }, { status: 400 });
    }

    // Embed profile
    const profileEmbedRes = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: JSON.stringify(profile)
    });
    const profileEmbedding = profileEmbedRes.data[0].embedding;

    // Embed each grant
    const grantEmbeddings = [];
    for (const grant of grants) {
      const embedRes = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: JSON.stringify(grant)
      });
      grantEmbeddings.push({
        grantId: grant.id,
        embedding: embedRes.data[0].embedding
      });
    }

    // Compute similarity scores
    const similarities = grantEmbeddings.map(g => {
      const dot = profileEmbedding.reduce((sum, v, i) => sum + v * g.embedding[i], 0);
      const magA = Math.sqrt(profileEmbedding.reduce((sum, v) => sum + v * v, 0));
      const magB = Math.sqrt(g.embedding.reduce((sum, v) => sum + v * v, 0));
      const similarity = dot / (magA * magB);

      return { grantId: g.grantId, similarity };
    });

    return NextResponse.json({ similarities });
  } catch (err: any) {
    console.error("Semantic gap detection error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
