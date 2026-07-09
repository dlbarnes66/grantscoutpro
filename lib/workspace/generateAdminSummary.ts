import { prisma } from "@/lib/prisma";

export async function generateAdminSummary(workspaceId: string) {
  const members = await prisma.workspaceMember.count({
    where: { workspaceId },
  });

  const files = await prisma.workspaceFile.count({
    where: { workspaceId },
  }).catch(() => 0);

  const searches = await prisma.searchAnalytics.count({
    where: { workspaceId },
  });

  const insights = await prisma.workspaceInsight.count({
    where: { workspaceId },
  });

  return {
    members,
    files,
    searches,
    insights,
  };
}
