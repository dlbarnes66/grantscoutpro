import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { embeddingToBytes } from "@/lib/embeddings";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, { params }) {
  try {
    const { query } = await req.json();
    const documentId = params.id;

    if (!query) {
      return NextResponse.json(
        { error: "query is required" },
        { status: 400 }
      );
    }

    // Embed the query
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const queryEmbedding = response.data[0].embedding;
    const queryBytes = embeddingToBytes(queryEmbedding);

    // Fetch all chunks for this document
    const results = await prisma.$queryRawUnsafe(`
      SELECT 
        id,
        content,
        (embedding <-> $1::bytea) AS distance
      FROM "DocumentEmbedding"
      WHERE "documentId" = $2
      ORDER BY embedding <-> $1::bytea
    `, queryBytes, documentId);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Match fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
