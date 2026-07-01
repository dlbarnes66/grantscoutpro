import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { sectionId } = await req.json();

    const section = await prisma.grantSection.findUnique({
      where: { id: sectionId },
      select: {
        title: true,
        content: true,
        purpose: true
      }
    });

    const prompt = `
You are an expert federal grant reviewer. Review the following grant section.

Section Title: ${section?.title}
Purpose: ${section?.purpose}

Content:
${section?.content}

Provide a JSON object:

{
  "score": {
    "clarity": 0-100,
    "alignment": 0-100,
    "completeness": 0-100
  },
  "redlines": ["...", "..."],
  "recommendations": ["...", "..."],
  "summary": "One paragraph reviewer summary"
}

Return ONLY valid JSON.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const output = completion.choices[0].message.content;

    return NextResponse.json(JSON.parse(output));
  } catch (error) {
    console.error("Grant Review Error:", error);
    return NextResponse.json(
      { error: "Failed to review section" },
      { status: 500 }
    );
  }
}
