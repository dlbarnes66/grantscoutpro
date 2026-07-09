export function calculateMatchScore(grant: any, profile: any) {
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
  if (profile.budget && grant.amountMax) {
    if (profile.budget <= grant.amountMax) {
      score += 15;
    }
  }

  // ⭐ Organization type alignment
  if (profile.orgType && grant.eligibility) {
    if (
      JSON.stringify(grant.eligibility)
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
