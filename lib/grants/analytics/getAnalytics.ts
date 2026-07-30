import { prisma } from "@/lib/prisma";
import { enforceAnalyticsTierAccess } from "./enforceAnalyticsTierAccess";
import { calculateAnalytics } from "./calculateAnalytics";

export async function getAnalytics({
  workspaceId,
  tier,
}: {
  workspaceId: string;
  tier: string;
}) {
  // ⭐ Fetch grants visible to this workspace
  const grants = await prisma.grant.findMany({
    where: {
      OR: [
        { workspaceId },
        { workspaceId: null }, // global grants
      ],
    },
  });

  // ⭐ Tier enforcement
  const tierFiltered = enforceAnalyticsTierAccess(grants, tier);

  // ⭐ Compute analytics
  const analytics = calculateAnalytics(tierFiltered);

  return analytics;
}
