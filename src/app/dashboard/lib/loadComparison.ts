import { prisma } from "@/lib/prisma";

export async function loadComparison(workspaceId: string) {
  const comparison = await prisma.grantComparison.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  if (!comparison) {
    return { comparison: null, grants: [] };
  }

  const grantIds = comparison.grants as string[];

  const grants = await prisma.grant.findMany({
    where: { id: { in: grantIds } },
  });

  return {
    comparison,
    grants,
  };
}
