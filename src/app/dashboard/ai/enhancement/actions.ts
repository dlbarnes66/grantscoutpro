"use server";

import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateGrantEnhancement(
  grantId: string,
  workspaceId: string,
  userId: string
) {
  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
    include: {
      sections: true,
      narratives: true,
      applications: { include: { versions: true } },
    },
  });

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { profile: true },
  });

  if (!grant || !workspace) throw new Error("Grant or workspace not found");

  const prompt = `
You are an AI grant enhancement engine. Enhance the following grant:

Grant:
Title: ${grant.title}
Agency: ${grant.agency}
Category: ${grant.category ?? ""}
Description: ${grant.description ?? ""}

Narratives:
${grant.narratives.map(n => n.content).join("\n\n")}

Organization:
Name: ${workspace.profile?.organizationName ?? ""}
Mission: ${workspace.profile?.mission ?? ""}
Programs: ${workspace.profile?.programs ?? ""}
Budget: ${workspace.profile?.annualBudget ?? ""}

Provide numeric values (0–100) for:
1. Narrative Enhancement Score
2. Structural Enhancement Score
3. Persuasive Enhancement Score
4. Compliance Enhancement Score
5. Evidence Enhancement Score
6. Strategic Enhancement Score
7. Overall Enhancement Score

Then provide:
8. Enhancement Analysis (4–8 paragraphs)
9. Narrative Enhancement Factors (bullet points)
10. Structural Enhancement Factors (bullet points)
11. Persuasive Enhancement Factors (bullet points)
12. Compliance Enhancement Factors (bullet points)
13. Evidence Enhancement Factors (bullet points)
14. Strategic Enhancement Factors (bullet points)
15. Recommended Enhancement Strategy (bullet points)
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0].message.content ?? "";

  const narrativeEnhancement = extractNumber(text, "narrative");
  const structuralEnhancement = extractNumber(text, "structural");
  const persuasiveEnhancement = extractNumber(text, "persuasive");
  const complianceEnhancement = extractNumber(text, "compliance");
  const evidenceEnhancement = extractNumber(text, "evidence");
  const strategicEnhancement = extractNumber(text, "strategic");
  const overall = extractNumber(text, "overall");

  const analysis = extractSection(text, "analysis");
  const narrativeFactors = extractSection(text, "narrative enhancement");
  const structuralFactors = extractSection(text, "structural enhancement");
  const persuasiveFactors = extractSection(text, "persuasive enhancement");
  const complianceFactors = extractSection(text, "compliance enhancement");
  const evidenceFactors = extractSection(text, "evidence enhancement");
  const strategicFactors = extractSection(text, "strategic enhancement");
  const strategy = extractSection(text, "strategy");

  const saved = await prisma.grantEnhancementHistory.create({
    data: {
      workspaceId,
      userId,
      grantId,
      narrativeEnhancement,
      structuralEnhancement,
      persuasiveEnhancement,
      complianceEnhancement,
      evidenceEnhancement,
      strategicEnhancement,
      overall,
      analysis,
      narrativeFactors,
      structuralFactors,
      persuasiveFactors,
      complianceFactors,
      evidenceFactors,
      strategicFactors,
      strategy,
    },
  });

  await prisma.grant.update({
    where: { id: grantId },
    data: {
      aiEnhanceNarrative: narrativeEnhancement,
      aiEnhanceStructural: structuralEnhancement,
      aiEnhancePersuasive: persuasiveEnhancement,
      aiEnhanceCompliance: complianceEnhancement,
      aiEnhanceEvidence: evidenceEnhancement,
      aiEnhanceStrategic: strategicEnhancement,
      aiEnhanceOverall: overall,
    },
  });

  await prisma.aiUsage.create({
    data: {
      workspaceId,
      userId,
      feature: "enhancement",
      tokens: response.usage?.total_tokens ?? 0,
      cost: (response.usage?.total_tokens ?? 0) * 0.00001,
    },
  });

  await prisma.aiLog.create({
    data: {
      workspaceId,
      userId,
      grantId,
      action: "Generated grant enhancement analysis",
    },
  });

  return {
    narrativeEnhancement,
    structuralEnhancement,
    persuasiveEnhancement,
    complianceEnhancement,
    evidenceEnhancement,
    strategicEnhancement,
    overall,
    analysis,
    narrativeFactors,
    structuralFactors,
    persuasiveFactors,
    complianceFactors,
    evidenceFactors,
    strategicFactors,
    strategy,
    id: saved.id,
  };
}

function extractNumber(text: string, label: string): number {
  const match = text.match(new RegExp(`${label}.*?(\\d+)`, "i"));
  return match ? Number(match[1]) : 0;
}

function extractSection(text: string, label: string): string {
  const match = text.match(new RegExp(`${label}:(.*)`, "s"));
  return match ? match[1].trim() : "";
}
