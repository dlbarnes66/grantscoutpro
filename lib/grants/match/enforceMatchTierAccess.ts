import { GrantTierAccess } from "@prisma/client";

export function enforceMatchTierAccess(grants: any[], tier: string) {
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
