// lib/grants/alerts/generateAlerts.ts

import { prisma } from "@/lib/prisma";
import { applyAlertRules } from "./applyAlertRules";
import { enforceAlertTierAccess } from "./enforceAlertTierAccess";
import { Grant, GrantTierAccess } from "@prisma/client";

type Tier =
  | "ENTERPRISE"
  | "PRO"
  | "FEDERAL_STATE"
  | "FEDERAL_ONLY";

export async function generateAlerts({
  workspaceId,
  tier,
}: {
  workspaceId: string;
  tier: Tier;
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
    .filter((a): a is NonNullable<typeof a> => a !== null);

  return {
    count: alerts.length,
    alerts,
  };
}
