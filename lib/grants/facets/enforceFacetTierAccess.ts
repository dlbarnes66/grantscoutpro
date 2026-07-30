// lib/grants/facets/enforceFacetTierAccess.ts

import { Grant, GrantTierAccess } from "@prisma/client";

type Tier =
  | "ENTERPRISE"
  | "PRO"
  | "FEDERAL_STATE"
  | "FEDERAL_ONLY";

export function enforceFacetTierAccess(
  grants: Array<Grant & { [key: string]: any }>,
  tier: Tier
) {
  return grants.filter((grant) => {
    switch (tier) {
      case "FEDERAL_ONLY":
        return grant.tierAccess === GrantTierAccess.FEDERAL_ONLY;

      case "FEDERAL_STATE":
        return (
          grant.tierAccess === GrantTierAccess.FEDERAL_ONLY ||
          grant.tierAccess === GrantTierAccess.FEDERAL_STATE
        );

      case "PRO":
        return (
          grant.tierAccess === GrantTierAccess.FEDERAL_ONLY ||
          grant.tierAccess === GrantTierAccess.FEDERAL_STATE ||
          grant.tierAccess === GrantTierAccess.PRO
        );

      case "ENTERPRISE":
        return true;

      default:
        return grant.tierAccess === GrantTierAccess.FEDERAL_ONLY;
    }
  });
}
