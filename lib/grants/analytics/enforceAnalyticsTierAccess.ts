// lib/grants/analytics/enforceAnalyticsTierAccess.ts

import { Grant, GrantTierAccess } from "@prisma/client";

type Tier =
  | "ENTERPRISE"
  | "PRO"
  | "FEDERAL_STATE"
  | "FEDERAL_ONLY";

export function enforceAnalyticsTierAccess(
  grants: Grant[],
  tier: Tier
) {
  return grants.filter((grant) => {
    switch (tier) {
      case "ENTERPRISE":
        return true;

      case "PRO":
        return (
          grant.tierAccess === GrantTierAccess.FEDERAL_ONLY ||
          grant.tierAccess === GrantTierAccess.FEDERAL_STATE ||
          grant.tierAccess === GrantTierAccess.PRO
        );

      case "FEDERAL_STATE":
        return (
          grant.tierAccess === GrantTierAccess.FEDERAL_ONLY ||
          grant.tierAccess === GrantTierAccess.FEDERAL_STATE
        );

      case "FEDERAL_ONLY":
      default:
        return grant.tierAccess === GrantTierAccess.FEDERAL_ONLY;
    }
  });
}
