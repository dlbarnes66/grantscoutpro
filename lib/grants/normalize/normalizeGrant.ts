// lib/grants/normalize/normalizeGrant.ts

import { GrantSource } from "@prisma/client";
import { mergeGrantFields, RawGrant } from "./mergeGrantFields";
import { applyTierAccess } from "./applyTierAccess";

export function normalizeGrant(raw: RawGrant, source: GrantSource) {
  const merged = mergeGrantFields(raw, source);
  const tiered = applyTierAccess(merged);

  return {
    ...tiered,

    aiEligibilityScore: null,
    aiAlignmentScore: null,
    aiCompetitivenessScore: null,
    aiRiskScore: null,
    aiReadinessScore: null,

    aiSummary: null,
    aiRecommendations: null,

    tags: [],
  };
}
