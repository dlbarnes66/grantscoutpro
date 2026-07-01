import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { workspaceId, title, summary, useAI } = await req.json();

    let finalSummary = summary;
    let requirements = "";
    let scoringCriteria = "";

    if (useAI) {
      const prompt = `
You are an expert grant analyst. Create a grant summary, requirements list, and scoring criteria based on this title:

Grant Title: ${title}

Return ONLY valid JSON:

{
  "summary": "...",
  "requirements": "...",
  "scoringCriteria": "..."
}
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const ai = JSON.parse(completion.choices[0].message.content);

      finalSummary = ai.summary;
      requirements = ai.requirements;
      scoringCriteria = ai.scoringCriteria;
    }

    const grant = await prisma.grant.create({
      data: {
        workspaceId,
        title,
        summary: finalSummary,
        requirements,
        scoringCriteria,
        status: "Not Started",
        priority: "Medium",
        statusHistory: [`${new Date().toISOString()} — Grant created`]
      }
    });

    return NextResponse.json({ success: true, grant });
  } catch (error) {
    console.error("Grant Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to create grant" },
      { status: 500 }
    );
  }
}
