import { prisma } from "@/lib/prisma";

export async function loadWorkspaceIntelligence(workspaceId: string) {
  const grants = await prisma.grant.findMany({
    where: { workspaceId },
    include: { sections: true },
    orderBy: { updatedAt: "desc" },
  });

  const narratives = await prisma.narrative.findMany({
    where: { grant: { workspaceId } },
    orderBy: { createdAt: "desc" },
  });

  const proposals = await prisma.application.findMany({
    where: { workspaceId },
    include: { versions: true },
    orderBy: { createdAt: "desc" },
  });

  const templates = await prisma.template.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  const insights = await prisma.workspaceInsight.findMany({
    where: { primaryWorkspaceId: workspaceId },
    orderBy: { createdAt: "desc" },
  });

  const automations = await prisma.automation.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  const usage = await prisma.aiUsage.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  const logs = await prisma.aiLog.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  const digests = await prisma.workspaceDigest.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return {
    grants,
    narratives,
    proposals,
    templates,
    insights,
    automations,
    usage,
    logs,
    digests,
  };
}
