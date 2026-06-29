import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grantId } = await req.json();

    if (!grantId) {
      return NextResponse.json({ error: "Missing grantId" }, { status: 400 });
    }

    const grant = await prisma.grant.findUnique({ where: { id: grantId } });

    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }

    const text = `${grant.title}\n${grant.description}`;

    const embedding = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    await prisma.grant.update({
      where: { id: grantId },
      data: { embedding: embedding.data[0].embedding },
    });

    return NextResponse.json({ embedded: true });
  } catch (err: any) {
    console.error("Embedding error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
