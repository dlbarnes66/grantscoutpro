// src/lib/billing/getPlan.ts

import { prisma } from "@/lib/db";

export async function getPlan(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      plan: true,
      subscriptionTier: true,
      billingStatus: true,
      billingPeriod: true,
      billingRenewalDate: true,
      org: {
        select: {
          tier: true,
        },
      },
    },
  });

  if (!workspace) {
    return {
      plan: "free",
      tier: "free",
      status: "inactive",
      period: "monthly",
      renewal: null,
    };
  }

  return {
    plan: workspace.plan ?? "free",
    tier: workspace.org?.tier ?? "free",
    status: workspace.billingStatus,
    period: workspace.billingPeriod,
    renewal: workspace.billingRenewalDate,
  };
}
