import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { query } = await req.json().catch(() => ({ query: "" }));

    const chunks = await prisma.documentEmbedding.findMany({
      where: { documentId: params.id },
      select: { text: true },
    });

    if (!chunks || chunks.length === 0) {
      return NextResponse.json(
        { error: "No embeddings found for this document." },
        { status: 404 }
      );
    }

    const combinedText = chunks.map((c) => c.text).join("\n\n");

    const prompt = query
      ? `You are summarizing a grant document. Focus on: ${query}.\n\nDocument:\n${combinedText}`
      : `You are summarizing a grant document. Provide a clear, concise summary.\n\nDocument:\n${combinedText}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert grant analyst. Provide clear, structured summaries.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const summary =
      completion.choices[0]?.message?.content ||
      "No summary could be generated.";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summary route error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary." },
      { status: 500 }
    );
  }
}
