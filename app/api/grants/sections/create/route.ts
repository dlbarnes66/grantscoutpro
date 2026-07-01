import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { grantId, title, purpose, useAI } = await req.json();

    let content = "";

    if (useAI) {
      const prompt = `
You are an expert grant writer. Create a section template for:

Section Title: ${title}
Purpose: ${purpose}

Return ONLY valid JSON:

{
  "content": "..."
}
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const ai = JSON.parse(completion.choices[0].message.content);
      content = ai.content;
    }

    const sectionCount = await prisma.grantSection.count({
      where: { grantId }
    });

    const section = await prisma.grantSection.create({
      data: {
        grantId,
        title,
        purpose,
        content,
        order: sectionCount + 1,
        previousVersions: []
      }
    });

    return NextResponse.json({ success: true, section });
  } catch (error) {
    console.error("Section Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to create section" },
      { status: 500 }
    );
  }
}
