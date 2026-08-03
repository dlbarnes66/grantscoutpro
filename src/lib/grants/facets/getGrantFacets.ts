// lib/grants/facets/getGrantFacets.ts

import { prisma } from "@/lib/prisma";
import { buildFacetResponse } from "./buildFacetResponse";
import { enforceFacetTierAccess } from "./enforceFacetTierAccess";
import { Grant } from "@prisma/client";

type Tier =
  | "ENTERPRISE"
  | "PRO"
  | "FEDERAL_STATE"
  | "FEDERAL_ONLY";

export async function getGrantFacets({
  workspaceId,
  tier,
}: {
  workspaceId?: string;
  tier: Tier;
}) {
  const grants: Array<Grant & { [key: string]: any }> =
    await prisma.grant.findMany({
      where: workspaceId
        ? {
            OR: [
              { workspaceId },
              { workspaceId: null },
            ],
          }
        : {},
    });

  const tierFiltered = enforceFacetTierAccess(grants, tier);

  return buildFacetResponse(tierFiltered);
}
