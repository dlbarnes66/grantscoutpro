import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST() {
  try {
    const grants = await prisma.grant.findMany();

    for (const grant of grants) {
      const text = `${grant.title}\n${grant.description}`;

      const embedding = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });

      await prisma.grant.update({
        where: { id: grant.id },
        data: { embedding: embedding.data[0].embedding },
      });
    }

    return NextResponse.json({ embedded: grants.length });
  } catch (err: any) {
    console.error("Clustering embed error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
