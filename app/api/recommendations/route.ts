import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = session.user.workspaceId;

    // Load workspace documents
    const docs = await prisma.workspaceDocument.findMany({
      where: { workspaceId },
      select: { id: true, title: true, content: true },
    });

    if (docs.length === 0) {
      return NextResponse.json({
        ok: true,
        recommendations: [],
      });
    }

    // Combine document content for AI context
    const combinedText = docs
      .map((d) => `${d.title}: ${d.content}`)
      .join("\n\n");

    // Ask AI for recommendations
    const ai = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert grant analyst. Recommend grants based on the user's documents.",
        },
        {
          role: "user",
          content: `Here are the user's documents:\n\n${combinedText}\n\nRecommend 5 grants with title, funder, amount, and reason.`,
        },
      ],
    });

    const text = ai.choices[0].message.content || "";

    // Parse AI output into structured items
    const recommendations = text
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => ({ text: line.trim() }));

    return NextResponse.json({
      ok: true,
      recommendations,
    });
  } catch (err) {
    console.error("Recommendations error:", err);
    return NextResponse.json(
      { error: "Failed to load recommendations" },
      { status: 500 }
    );
  }
}
