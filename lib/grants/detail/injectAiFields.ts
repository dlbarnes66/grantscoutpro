export function injectAiFields(grant: any) {
  return {
    ...grant,

    ai: {
      eligibilityScore: grant.aiEligibilityScore || null,
      alignmentScore: grant.aiAlignmentScore || null,
      competitivenessScore: grant.aiCompetitivenessScore || null,
      riskScore: grant.aiRiskScore || null,
      readinessScore: grant.aiReadinessScore || null,

      summary: grant.aiSummary || null,
      recommendations: grant.aiRecommendations || null,
    },
  };
}
