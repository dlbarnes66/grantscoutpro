import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const grants = await prisma.grant.findMany({
      orderBy: { createdAt: "asc" },
    });

    const embeddings: any[] = [];

    for (const grant of grants) {
      const text = `${grant.title}\n${grant.summary ?? ""}\n${grant.agency ?? ""}`;

      const embedding = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });

      embeddings.push({
        grantId: grant.id,
        embedding: embedding.data[0].embedding,
      });
    }

    return NextResponse.json({ embeddings });
  } catch (err: any) {
    console.error("Embedding error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
