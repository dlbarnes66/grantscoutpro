// lib/grants/detail/injectAiFields.ts

import { Grant } from "@prisma/client";

type PartialGrantForTier = {
  id: string;
  title: string;
  summary: string;
  description: string;
  deadline: Date | null;
  source: string;
  tierAccess: any;
};

export function injectAiFields(grant: Grant | PartialGrantForTier) {
  return {
    ...grant,

    ai: {
      eligibilityScore: (grant as Grant).aiEligibilityScore || null,
      alignmentScore: (grant as Grant).aiAlignmentScore || null,
      competitivenessScore: (grant as Grant).aiCompetitivenessScore || null,
      riskScore: (grant as Grant).aiRiskScore || null,
      readinessScore: (grant as Grant).aiReadinessScore || null,

      summary: (grant as Grant).aiSummary || null,
      recommendations: (grant as Grant).aiRecommendations || null,
    },
  };
}
