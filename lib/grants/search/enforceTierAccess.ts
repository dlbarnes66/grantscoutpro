import { GrantTierAccess } from "@prisma/client";

export function enforceTierAccess(grants: any[], tier: string) {
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
        return true; // Enterprise sees everything

      default:
        return grant.tierAccess === GrantTierAccess.FEDERAL_ONLY;
    }
  });
}
