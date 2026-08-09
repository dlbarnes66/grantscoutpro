import { prisma } from "@/lib/prisma";

export async function loadWorkspaceIntelligence(workspaceId: string) {
  // Grants in this workspace
  const grants = await prisma.grant.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  // Insights where this workspace is primary or secondary
  const insights = await prisma.workspaceInsight.findMany({
    where: {
      OR: [
        { primaryWorkspaceId: workspaceId },
        { secondaryWorkspaceId: workspaceId },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  // Narratives tied to grants in this workspace
  const narratives = await prisma.narrative.findMany({
    where: {
      grant: {
        workspaceId,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Applications (proposals) with versions
  const proposals = await prisma.application.findMany({
    where: { workspaceId },
    include: {
      versions: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Automations for this workspace
  const automations = await prisma.automation.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  // AI logs (actions)
  const logs = await prisma.aiLog.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  // AI usage
  const usage = await prisma.aiUsage.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  // Templates & digests not modeled in schema; return empty arrays to satisfy UI.
  const templates: any[] = [];
  const digests: any[] = [];

  return {
    grants,
    insights,
    narratives,
    proposals,
    templates,
    automations,
    logs,
    usage,
    digests,
  };
}
