export function calculateAnalytics(grants: any[]) {
  const categories: Record<string, number> = {};
  const agencies: Record<string, number> = {};
  const states: Record<string, number> = {};
  const foundations: Record<string, number> = {};

  let totalFunding = 0;
  let avgFunding = 0;

  let aiEligibilityAvg = 0;
  let aiAlignmentAvg = 0;
  let aiCompetitivenessAvg = 0;
  let aiRiskAvg = 0;
  let aiReadinessAvg = 0;

  for (const g of grants) {
    // ⭐ Category analytics
    if (g.category) {
      categories[g.category] = (categories[g.category] || 0) + 1;
    }

    // ⭐ Agency analytics
    if (g.agency) {
      agencies[g.agency] = (agencies[g.agency] || 0) + 1;
    }

    // ⭐ State analytics
    if (g.eligibleStates) {
      states[g.eligibleStates] = (states[g.eligibleStates] || 0) + 1;
    }

    // ⭐ Foundation analytics
    if (g.foundationName) {
      foundations[g.foundationName] =
        (foundations[g.foundationName] || 0) + 1;
    }

    // ⭐ Funding analytics
    if (g.amountMax) {
      totalFunding += g.amountMax;
    }

    // ⭐ AI scoring analytics
    aiEligibilityAvg += g.aiEligibilityScore || 0;
    aiAlignmentAvg += g.aiAlignmentScore || 0;
    aiCompetitivenessAvg += g.aiCompetitivenessScore || 0;
    aiRiskAvg += g.aiRiskScore || 0;
    aiReadinessAvg += g.aiReadinessScore || 0;
  }

  const count = grants.length;

  return {
    totals: {
      grants: count,
      totalFunding,
      avgFunding: count > 0 ? totalFunding / count : 0,
    },

    categories,
    agencies,
    states,
    foundations,

    aiScores: {
      eligibility: count > 0 ? aiEligibilityAvg / count : 0,
      alignment: count > 0 ? aiAlignmentAvg / count : 0,
      competitiveness: count > 0 ? aiCompetitivenessAvg / count : 0,
      risk: count > 0 ? aiRiskAvg / count : 0,
      readiness: count > 0 ? aiReadinessAvg / count : 0,
    },
  };
}
