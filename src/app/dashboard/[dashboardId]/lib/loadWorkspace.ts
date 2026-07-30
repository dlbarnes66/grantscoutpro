import { prisma } from "@/lib/prisma";

export async function loadWorkspace(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: true,
      aiUsage: true,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const isMember = workspace.members.some(m => m.userId === userId);

  if (!isMember) {
    throw new Error("You do not have access to this workspace");
  }

  return {
    id: workspace.id,
    name: workspace.name,
    aiUsage: workspace.aiUsage ?? { tokensUsed: 0, cost: 0 },
  };
}
