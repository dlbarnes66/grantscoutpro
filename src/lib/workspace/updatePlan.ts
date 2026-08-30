// src/lib/workspace/billing/updatePlan.ts
import { prisma } from "@/lib/db";

export async function updateWorkspacePlan(workspaceId: string, plan: string) {
  // Update workspace subscription tier + billing status
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      subscriptionTier: plan,
      billingStatus: "active",
    },
  });

  // Log the plan change in BillingLog using the relation field
  await prisma.billingLog.create({
    data: {
      type: "plan_update",
      message: `Workspace plan updated to ${plan}`,
      workspace: {
        connect: { id: workspaceId },
      },
    },
  });

  return { workspaceId, plan };
}
