import { prisma } from "@/lib/prisma";

export async function loadAI(grantId: string) {
  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
    select: {
      aiEligibilityScore: true,
      aiAlignmentScore: true,
      aiCompetitivenessScore: true,
      aiRiskScore: true,
      aiReadinessScore: true,
      aiSummary: true,
      aiRecommendations: true,
      title: true,
      description: true,
      eligibility: true,
      amount: true,
      deadline: true,
    },
  });

  return grant;
}
