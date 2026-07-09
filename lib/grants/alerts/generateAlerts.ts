import prisma from "@/lib/prisma";
import { applyAlertRules } from "./applyAlertRules";
import { enforceAlertTierAccess } from "./enforceAlertTierAccess";

export async function generateAlerts({
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
  const tierFiltered = enforceAlertTierAccess(grants, tier);

  // ⭐ Apply alert rules
  const alerts = tierFiltered
    .map((grant) => applyAlertRules(grant))
    .filter((a) => a !== null);

  return {
    count: alerts.length,
    alerts,
  };
}
