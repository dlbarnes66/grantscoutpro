// src/lib/workspace/billing/getPlan.ts

import { prisma } from "@/lib/db";

export async function getWorkspacePlan(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      plan: true,
      subscriptionTier: true,
      billingStatus: true,
      orgId: true,
    },
  });

  if (!workspace) {
    return {
      plan: "free",
      tier: "basic",
      billingStatus: "inactive",
    };
  }

  let orgPlan = null;

  if (workspace.orgId) {
    const org = await prisma.org.findUnique({
      where: { id: workspace.orgId },
      select: { tier: true },
    });

    orgPlan = org?.tier ?? null;
  }

  return {
    plan: workspace.plan,
    tier: workspace.subscriptionTier,
    billingStatus: workspace.billingStatus,
    orgPlan,
  };
}
