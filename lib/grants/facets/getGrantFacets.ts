import { prisma } from "@/lib/prisma";
import { buildFacetResponse } from "./buildFacetResponse";
import { enforceFacetTierAccess } from "./enforceFacetTierAccess";

export async function getGrantFacets({
  workspaceId,
  tier,
}: {
  workspaceId?: string;
  tier: string;
}) {
  // ⭐ Fetch all grants (we will filter by tier later)
  const grants = await prisma.grant.findMany({
    where: workspaceId
      ? {
          OR: [
            { workspaceId },
            { workspaceId: null }, // global grants
          ],
        }
      : {},
  });

  // ⭐ Apply tier access rules
  const tierFiltered = enforceFacetTierAccess(grants, tier);

  // ⭐ Build facet response
  return buildFacetResponse(tierFiltered);
}
