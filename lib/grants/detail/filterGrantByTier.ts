import { GrantTierAccess } from "@prisma/client";

export function filterGrantByTier(grant: any, tier: string) {
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
      url: grant.url,
      source: grant.source,
      tierAccess: grant.tierAccess,
    };
  }

  return grant;
}
