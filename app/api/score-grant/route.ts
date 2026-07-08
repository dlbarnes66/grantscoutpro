import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: Request) {
  const { grantId, userId } = await req.json();

  if (!grantId || !userId) {
    return NextResponse.json(
      { error: "grantId and userId are required" },
      { status: 400 }
    );
  }

  const grant = await prisma.grantPreview.findUnique({
    where: { id: grantId },
  });

  if (!grant) {
    return NextResponse.json({ error: "Grant not found" }, { status: 404 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "User profile not found" },
      { status: 404 }
    );
  }

  const prompt = `
You are an elite grant evaluation engine.

Evaluate the following grant for the following organization.

Return ONLY valid JSON in this format:

{
  "eligibilityScore": number,
  "fitScore": number,
  "riskScore": number,
  "competitiveness": number,
  "fundingStrength": number,
  "overallScore": number,
  "fitExplanation": "string",
  "risks": "string",
  "nextSteps": "string"
}

Scores must be between 0 and 1.

---

ORGANIZATION PROFILE:
${JSON.stringify(profile, null, 2)}

---

GRANT DETAILS:
${JSON.stringify(grant, null, 2)}
`;

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 2000,
    temperature: 0.1,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // ⭐ Find the text block returned by Claude
const textBlock = response.content.find(
  (block: any) => block.type === "text"
);

if (!textBlock) {
  throw new Error("Claude returned no text content");
}

// ⭐ Cast to any so TypeScript stops complaining
const json = JSON.parse((textBlock as any).text);


  const updated = await prisma.grantPreview.update({
    where: { id: grantId },
    data: {
      eligibilityScore: json.eligibilityScore,
      fitScore: json.fitScore,
      riskScore: json.riskScore,
      competitiveness: json.competitiveness,
      fundingStrength: json.fundingStrength,
      overallScore: json.overallScore,
      fitExplanation: json.fitExplanation,
      risks: json.risks,
      nextSteps: json.nextSteps,
    },
  });

  return NextResponse.json({ grant: updated });
}
