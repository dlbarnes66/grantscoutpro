import { prisma } from "@/lib/prisma";
import { filterGrantByTier } from "./filterGrantByTier";
import { injectAiFields } from "./injectAiFields";

export async function getGrantDetail({
  id,
  tier,
  workspaceId,
}: {
  id: string;
  tier: string;
  workspaceId?: string;
}) {
  const grant = await prisma.grant.findUnique({
    where: { id },
    include: {
      documents: true,
      GrantDraft: true,
      GrantSection: true,
      applicationHistories: true,
      applications: true,
      narratives: true,
    },
  });

  if (!grant) return null;

  // ⭐ Tier enforcement
  const tierFiltered = filterGrantByTier(grant, tier);

  // ⭐ Workspace scoping
  if (workspaceId && grant.workspaceId && grant.workspaceId !== workspaceId) {
    return null;
  }

  // ⭐ AI fields injection
  const aiInjected = injectAiFields(tierFiltered);

  return aiInjected;
}
