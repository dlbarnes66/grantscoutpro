import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(req: Request, { params }: any) {
  const { grantId } = params;

  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
  });

  return NextResponse.json(grant);
}

export async function POST(req: Request, { params }: any) {
  const { grantId } = params;

  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
  });

  if (!grant) {
    return NextResponse.json({ error: "Grant not found" }, { status: 404 });
  }

  const prompt = `
You are an expert grant reviewer. Analyze the following grant:

Title: ${grant.title}
Description: ${grant.description}
Eligibility: ${JSON.stringify(grant.eligibility)}
Amount: ${grant.amount}
Deadline: ${grant.deadline}

Provide:
- Eligibility Score (0-100)
- Alignment Score (0-100)
- Competitiveness Score (0-100)
- Risk Score (0-100)
- Readiness Score (0-100)
- Summary (3–5 sentences)
- Recommendations (JSON array)
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0].message.content;

  const parsed = JSON.parse(text);

  const updated = await prisma.grant.update({
    where: { id: grantId },
    data: {
      aiEligibilityScore: parsed.eligibility,
      aiAlignmentScore: parsed.alignment,
      aiCompetitivenessScore: parsed.competitiveness,
      aiRiskScore: parsed.risk,
      aiReadinessScore: parsed.readiness,
      aiSummary: parsed.summary,
      aiRecommendations: parsed.recommendations,
    },
  });

  return NextResponse.json(updated);
}
