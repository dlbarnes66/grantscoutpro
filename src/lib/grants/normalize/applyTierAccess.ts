// lib/grants/normalize/applyTierAccess.ts

import { GrantSource, GrantTierAccess } from "@prisma/client";

export function applyTierAccess(grant: {
  source: GrantSource;
  tierAccess?: GrantTierAccess;
}) {
  switch (grant.source) {
    case GrantSource.FEDERAL:
      grant.tierAccess = GrantTierAccess.FEDERAL_ONLY;
      break;

    case GrantSource.STATE:
      grant.tierAccess = GrantTierAccess.FEDERAL_STATE;
      break;

    case GrantSource.FOUNDATION:
    case GrantSource.PHILANTHROPIC:
      grant.tierAccess = GrantTierAccess.PRO;
      break;

    default:
      grant.tierAccess = GrantTierAccess.FEDERAL_ONLY;
  }

  return grant;
}
