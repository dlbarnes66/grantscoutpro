import { prisma } from "@/lib/prisma";

export async function loadGrantIntelligence(grantId: string, workspaceId: string) {
  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
  });

  const sections = await prisma.grantSection.findMany({
    where: { grantId },
    orderBy: { order: "asc" },
  });

  const narratives = await prisma.narrative.findMany({
    where: { grantId },
    orderBy: { createdAt: "desc" },
  });

  const narrativeHistory = await prisma.narrativeHistory.findMany({
    where: { grantId },
    orderBy: { createdAt: "desc" },
  });

  const rewrites = await prisma.rewriteHistory.findMany({
    where: { grantId },
    orderBy: { createdAt: "desc" },
  });

  const applications = await prisma.application.findMany({
    where: { grantId },
    include: { versions: true },
    orderBy: { createdAt: "desc" },
  });

  const logs = await prisma.aiLog.findMany({
    where: { grantId },
    orderBy: { createdAt: "desc" },
  });

  const usage = await prisma.aiUsage.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return {
    grant,
    sections,
    narratives,
    narrativeHistory,
    rewrites,
    applications,
    logs,
    usage,
  };
}
