import { prisma } from "@/lib/db";

export async function updateWorkspacePlan(workspaceId: string, subscriptionTier: string) {
  // Update workspace tier
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { subscriptionTier },
  });

  // Log billing event
  await prisma.billingLog.create({
    data: {
      workspaceId,
      type: "plan_update",
      message: `Workspace subscription tier updated to ${subscriptionTier}`,
    },
  });

  return { workspaceId, subscriptionTier };
}
