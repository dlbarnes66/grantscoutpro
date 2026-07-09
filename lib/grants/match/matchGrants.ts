import { prisma } from "@/lib/prisma";
import { calculateMatchScore } from "./calculateMatchScore";
import { enforceMatchTierAccess } from "./enforceMatchTierAccess";

export async function matchGrants({
  workspaceId,
  tier,
  profile,
}: {
  workspaceId: string;
  tier: string;
  profile: any;
}) {
  // ⭐ Fetch all grants visible to this workspace
  const grants = await prisma.grant.findMany({
    where: {
      OR: [
        { workspaceId },
        { workspaceId: null }, // global grants
      ],
    },
  });

  // ⭐ Tier enforcement
  const tierFiltered = enforceMatchTierAccess(grants, tier);

  // ⭐ Calculate match scores
  const scored = tierFiltered.map((grant) => {
    const score = calculateMatchScore(grant, profile);
    return { grant, score };
  });

  // ⭐ Sort by score (descending)
  scored.sort((a, b) => b.score - a.score);

  return {
    count: scored.length,
    results: scored,
  };
}
