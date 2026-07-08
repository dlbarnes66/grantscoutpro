import { NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { grantId, workspaceId } = await req.json();

    if (!grantId || !workspaceId) {
      return NextResponse.json(
        { error: "grantId and workspaceId are required" },
        { status: 400 }
      );
    }

    // Fetch grant
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
      select: {
        title: true,
        summary: true,
        requirements: true,
        scoringCriteria: true,
        fullText: true,
      },
    });

    // Fetch workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        name: true,
        mission: true,
        history: true,
        writingStyle: true,
        tonePreference: true,
        readingLevel: true,
      },
    });

    const prompt = `
You are an expert grant analyst. Analyze the following grant and workspace.

Grant:
- Title: ${grant?.title}
- Summary: ${grant?.summary}
- Requirements: ${grant?.requirements}
- Scoring Criteria: ${grant?.scoringCriteria}
- Full Text: ${grant?.fullText}

Workspace:
- Name: ${workspace?.name}
- Mission: ${workspace?.mission}
- History: ${workspace?.history}

Provide a JSON report with:
{
  "eligibility": "...",
  "fitScore": 0-100,
  "risks": ["...", "..."],
  "alignment": ["...", "..."],
  "recommendations": ["...", "..."],
  "missingInfo": ["...", "..."]
}
Return ONLY valid JSON.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const output = completion.choices[0].message.content;

    return NextResponse.json(JSON.parse(output));
  } catch (error: any) {
    console.error("Grant Intelligence Error:", error);
    return NextResponse.json(
      { error: "Grant intelligence analysis failed" },
      { status: 500 }
    );
  }
}
