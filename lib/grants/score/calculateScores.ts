export function calculateScores(grant: any, profile: any) {
  // ⭐ Eligibility Score
  const eligibility =
    grant.eligibility &&
    profile.orgType &&
    JSON.stringify(grant.eligibility)
      .toLowerCase()
      .includes(profile.orgType.toLowerCase())
      ? 85
      : 40;

  // ⭐ Alignment Score (mission + category)
  let alignment = 0;
  if (profile.mission && grant.foundationMission) {
    if (
      grant.foundationMission
        .toLowerCase()
        .includes(profile.mission.toLowerCase())
    ) {
      alignment += 50;
    }
  }
  if (profile.category && grant.category) {
    if (
      grant.category.toLowerCase().includes(profile.category.toLowerCase())
    ) {
      alignment += 25;
    }
  }

  // ⭐ Competitiveness Score (funding vs budget)
  const competitiveness =
    profile.budget && grant.amountMax
      ? profile.budget <= grant.amountMax
        ? 70
        : 30
      : 50;

  // ⭐ Risk Score (deadline + restrictions)
  const risk =
    grant.foundationRestrictions || grant.deadline === null ? 30 : 70;

  // ⭐ Readiness Score (alignment + eligibility)
  const readiness = Math.round((alignment + eligibility) / 2);

  return {
    eligibility,
    alignment,
    competitiveness,
    risk,
    readiness,
  };
}
