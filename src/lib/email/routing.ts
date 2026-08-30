// src/lib/email/routing.ts

import { getWorkspacePlan } from "@/lib/workspace/billing/getPlan";

export async function getEmailRouting(workspaceId: string) {
  const planInfo = await getWorkspacePlan(workspaceId);

  return {
    workspaceId,
    plan: planInfo.plan,
    tier: planInfo.tier,
    orgPlan: planInfo.orgPlan,
    billingStatus: planInfo.billingStatus,
  };
}
