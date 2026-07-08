import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { grantId } = await req.json();

  const grant = await prisma.grantPreview.findUnique({
    where: { id: grantId },
  });

  if (!grant) {
    return NextResponse.json({ error: "Grant not found" }, { status: 404 });
  }

  // Build prompt
  const prompt = `
You are an expert grant reviewer. Analyze the following grant:

Title: ${grant.title}
Summary: ${grant.summary}
Amount: ${grant.amount}
Deadline: ${grant.deadline}
Category: ${grant.category}
Agency: ${grant.agency}

Provide:
- Eligibility score (0-100)
- Fit score (0-100)
- Risk score (0-100)
- Competitiveness (0-100)
- Funding strength (0-100)
- Overall score (0-100)
- Fit explanation
- Risks
- Next steps
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0].message.content;

  // Extract JSON from the AI response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
  }

  const analysis = JSON.parse(jsonMatch[0]);

  // Save to Prisma
  const updated = await prisma.grantPreview.update({
    where: { id: grantId },
    data: {
      eligibilityScore: analysis.eligibilityScore,
      fitScore: analysis.fitScore,
      riskScore: analysis.riskScore,
      competitiveness: analysis.competitiveness,
      fundingStrength: analysis.fundingStrength,
      overallScore: analysis.overallScore,
      fitExplanation: analysis.fitExplanation,
      risks: analysis.risks,
      nextSteps: analysis.nextSteps,
    },
  });

  return NextResponse.json({ grant: updated });
}
