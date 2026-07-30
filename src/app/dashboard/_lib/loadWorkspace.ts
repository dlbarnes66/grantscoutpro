import { prisma } from "@/lib/prisma";

export async function loadWorkspace(userId: string) {
  const workspace = await prisma.workspace.findFirst({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      billing: true,
      aiUsage: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!workspace) {
    return null;
  }

  const latestAiUsage = workspace.aiUsage[0];

  return {
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    role: "member",
    subscriptionTier: workspace.subscriptionTier,
    trialActive: workspace.trialActive,
    trialDaysRemaining: workspace.trialDaysRemaining,
    trialLocked: workspace.trialLocked,
    aiTokensUsed: latestAiUsage?.tokens ?? 0,
    aiCost: latestAiUsage?.cost ?? 0,
  };
}
