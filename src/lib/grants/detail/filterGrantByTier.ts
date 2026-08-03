// lib/grants/detail/filterGrantByTier.ts

import { Grant, GrantTierAccess } from "@prisma/client";

type Tier =
  | "ENTERPRISE"
  | "PRO"
  | "FEDERAL_STATE"
  | "FEDERAL_ONLY";

export function filterGrantByTier(grant: Grant, tier: Tier) {
  const allowed =
    tier === "ENTERPRISE"
      ? true
      : tier === "PRO"
      ? grant.tierAccess !== GrantTierAccess.FEDERAL_ONLY &&
        grant.tierAccess !== GrantTierAccess.FEDERAL_STATE
      : tier === "FEDERAL_STATE"
      ? grant.tierAccess === GrantTierAccess.FEDERAL_ONLY ||
        grant.tierAccess === GrantTierAccess.FEDERAL_STATE
      : grant.tierAccess === GrantTierAccess.FEDERAL_ONLY;

  if (!allowed) {
    return {
      id: grant.id,
      title: grant.title,
      summary: grant.summary,
      description: grant.description,
      deadline: grant.deadline,
      source: grant.source,
      tierAccess: grant.tierAccess,
    };
  }

  return grant;
}
