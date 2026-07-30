import { prisma } from "@/lib/prisma";
import { enforceScoreTierAccess } from "./enforceScoreTierAccess";
import { calculateScores } from "./calculateScores";

export async function scoreGrant({
  grantId,
  tier,
  profile,
}: {
  grantId: string;
  tier: string;
  profile: any;
}) {
  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
  });

  if (!grant) return { error: "Grant not found" };

  // ⭐ Tier enforcement
  const allowed = enforceScoreTierAccess(grant, tier);
  if (!allowed) {
    return {
      error: "Tier does not allow scoring for this grant",
    };
  }

  // ⭐ Calculate scores
  const scores = calculateScores(grant, profile);

  // ⭐ Persist scores into Prisma
  await prisma.grant.update({
    where: { id: grantId },
    data: {
      aiEligibilityScore: scores.eligibility,
      aiAlignmentScore: scores.alignment,
      aiCompetitivenessScore: scores.competitiveness,
      aiRiskScore: scores.risk,
      aiReadinessScore: scores.readiness,
    },
  });

  return {
    grantId,
    scores,
  };
}
