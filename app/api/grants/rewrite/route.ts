import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { sectionId } = await req.json();

    const section = await prisma.grantSection.findUnique({
      where: { id: sectionId },
      select: {
        id: true,
        title: true,
        content: true,
        purpose: true,
        previousVersions: true
      }
    });

    const prompt = `
You are an expert federal grant writer. Rewrite the following section to improve clarity, alignment, completeness, and professional tone.

Section Title: ${section?.title}
Purpose: ${section?.purpose}

Original Content:
${section?.content}

Provide a JSON object:

{
  "rewritten": "Improved rewritten section text",
  "notes": ["Rewrite notes...", "More notes..."]
}

Return ONLY valid JSON.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const output = JSON.parse(completion.choices[0].message.content);

    // Save previous version
    await prisma.grantSection.update({
      where: { id: sectionId },
      data: {
        previousVersions: [
          ...(section?.previousVersions || []),
          {
            date: new Date().toISOString(),
            content: section?.content || ""
          }
        ]
      }
    });

    return NextResponse.json(output);
  } catch (error) {
    console.error("Grant Rewrite Error:", error);
    return NextResponse.json(
      { error: "Failed to rewrite section" },
      { status: 500 }
    );
  }
}
