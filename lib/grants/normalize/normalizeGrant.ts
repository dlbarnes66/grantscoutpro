import { GrantSource, GrantTierAccess } from "@prisma/client";
import { mergeGrantFields } from "./mergeGrantFields";
import { applyTierAccess } from "./applyTierAccess";

export function normalizeGrant(raw: any, source: GrantSource) {
  // ⭐ Step 1: Merge fields from raw source into unified structure
  const merged = mergeGrantFields(raw, source);

  // ⭐ Step 2: Apply tier access rules
  const tiered = applyTierAccess(merged);

  // ⭐ Step 3: Final normalized grant object
  return {
    ...tiered,

    // ⭐ AI-ready fields
    aiEligibilityScore: null,
    aiAlignmentScore: null,
    aiCompetitivenessScore: null,
    aiRiskScore: null,
    aiReadinessScore: null,

    aiSummary: null,
    aiRecommendations: null,

    // ⭐ Tags
    tags: [],
  };
}
