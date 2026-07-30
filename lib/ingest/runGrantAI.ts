import { prisma } from "@/lib/prisma";

export async function runGrantAI(grantId: string) {
  // Mock AI for now — plug in real model later
  const scores = {
    aiEligibilityScore: Math.floor(Math.random() * 100),
    aiAlignmentScore: Math.floor(Math.random() * 100),
    aiCompetitivenessScore: Math.floor(Math.random() * 100),
    aiRiskScore: Math.floor(Math.random() * 100),
    aiReadinessScore: Math.floor(Math.random() * 100),
    aiSummary: "This grant appears to be a strong match based on eligibility and alignment.",
    aiRecommendations: [
      "Clarify target beneficiaries.",
      "Strengthen evidence for impact.",
      "Align budget more tightly with outcomes.",
    ],
  };

  await prisma.grant.update({
    where: { id: grantId },
    data: scores,
  });

  // Log AI usage (simple)
  await prisma.aiUsage.create({
    data: {
      workspaceId: "global",
      feature: "ingest_ai",
      tokens: 100,
      cost: 0.02,
    },
  });

  return scores;
}
