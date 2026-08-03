// lib/grants/analytics/getAnalytics.ts

import { enforceAnalyticsTierAccess } from "./enforceAnalyticsTierAccess";
import { calculateAnalytics } from "./calculateAnalytics";
import { Grant } from "@prisma/client";

type Tier =
  | "ENTERPRISE"
  | "PRO"
  | "FEDERAL_STATE"
  | "FEDERAL_ONLY";

export async function getAnalytics(
  grants: Grant[],
  tier: string
) {
  // ⭐ Normalize incoming tier string → strict Tier type
  const normalizedTier: Tier = (() => {
    const t = tier.toUpperCase();

    if (t === "ENTERPRISE") return "ENTERPRISE";
    if (t === "PRO") return "PRO";
    if (t === "FEDERAL_STATE") return "FEDERAL_STATE";
    if (t === "FEDERAL_ONLY") return "FEDERAL_ONLY";

    // ⭐ Safe fallback
    return "FEDERAL_ONLY";
  })();

  // ⭐ Enforce tier access
  const tierFiltered = enforceAnalyticsTierAccess(grants, normalizedTier);

  // ⭐ Compute analytics
  return calculateAnalytics(tierFiltered);
}
