// lib/grants/match/matchGrants.ts

import { prisma } from "@/lib/prisma";
import { calculateMatchScore, MatchProfile } from "./calculateMatchScore";
import { enforceMatchTierAccess, Tier } from "./enforceMatchTierAccess";
import { Grant } from "@prisma/client";

export async function matchGrants({
  workspaceId,
  tier,
  profile,
}: {
  workspaceId: string;
  tier: Tier;
  profile: MatchProfile;
}) {
  // ⭐ Fetch all grants visible to this workspace
  const grants: Grant[] = await prisma.grant.findMany({
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
