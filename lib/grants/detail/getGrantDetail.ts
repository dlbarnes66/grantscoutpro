// lib/grants/detail/getGrantDetail.ts

import { prisma } from "@/lib/prisma";
import { filterGrantByTier } from "./filterGrantByTier";
import { injectAiFields } from "./injectAiFields";
import { Grant } from "@prisma/client";

type Tier =
  | "ENTERPRISE"
  | "PRO"
  | "FEDERAL_STATE"
  | "FEDERAL_ONLY";

export async function getGrantDetail({
  id,
  tier,
  workspaceId,
}: {
  id: string;
  tier: Tier;
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

  const tierFiltered = filterGrantByTier(grant, tier);

  if (workspaceId && grant.workspaceId && grant.workspaceId !== workspaceId) {
    return null;
  }

  return injectAiFields(tierFiltered);
}
