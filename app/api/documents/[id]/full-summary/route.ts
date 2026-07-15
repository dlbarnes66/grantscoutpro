import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, { params }) {
  try {
    const documentId = params.id;

    // Fetch the full document content
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      select: { content: true },
    });

    if (!doc || !doc.content) {
      return NextResponse.json(
        { error: "Document not found or has no content" },
        { status: 404 }
      );
    }

    const fullText =
      typeof doc.content === "string"
        ? doc.content
        : JSON.stringify(doc.content);

    // Ask AI to summarize the entire document
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that summarizes full documents. Provide a clear, concise executive summary capturing the main ideas, purpose, and important details.",
        },
        {
          role: "user",
          content: fullText,
        },
      ],
    });

    const summary = response.choices[0].message.content;

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Full summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate full summary" },
      { status: 500 }
    );
  }
}
