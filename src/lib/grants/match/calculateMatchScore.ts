// lib/grants/match/calculateMatchScore.ts

import { Grant } from "@prisma/client";

export interface MatchProfile {
  mission?: string;
  state?: string;
  budget?: number;
  orgType?: string;
  category?: string;
}

export function calculateMatchScore(grant: Grant, profile: MatchProfile) {
  let score = 0;

  // ⭐ Mission alignment
  if (profile.mission && grant.foundationMission) {
    if (
      grant.foundationMission
        .toLowerCase()
        .includes(profile.mission.toLowerCase())
    ) {
      score += 25;
    }
  }

  // ⭐ Geographic alignment
  if (profile.state && grant.eligibleStates) {
    if (
      grant.eligibleStates
        .toLowerCase()
        .includes(profile.state.toLowerCase())
    ) {
      score += 20;
    }
  }

  // ⭐ Funding alignment
  if (profile.budget && grant.amountMax != null) {
    if (profile.budget <= grant.amountMax) {
      score += 15;
    }
  }

  // ⭐ Organization type alignment
  if (profile.orgType && grant.eligibility) {
    const eligibilityString =
      typeof grant.eligibility === "string"
        ? grant.eligibility
        : JSON.stringify(grant.eligibility);

    if (
      eligibilityString
        .toLowerCase()
        .includes(profile.orgType.toLowerCase())
    ) {
      score += 20;
    }
  }

  // ⭐ Category alignment
  if (profile.category && grant.category) {
    if (
      grant.category.toLowerCase().includes(profile.category.toLowerCase())
    ) {
      score += 10;
    }
  }

  // ⭐ AI scoring integration (if available)
  if (grant.aiAlignmentScore) score += grant.aiAlignmentScore * 0.1;
  if (grant.aiEligibilityScore) score += grant.aiEligibilityScore * 0.1;

  return score;
}
