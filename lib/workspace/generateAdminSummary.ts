import { prisma } from "@/lib/prisma";

export async function generateAdminSummary(workspaceId: string) {
  const insights = await prisma.workspaceInsight.count({
    where: {
      OR: [
        { primaryWorkspaceId: workspaceId },
        { secondaryWorkspaceId: workspaceId }
      ]
    }
  });

  return {
    totalInsights: insights
  };
}
