// src/lib/workspace/effectivePlan.ts
//
// One place to ask "what plan does this workspace have right now?". It
// follows resolveEffectivePlanId: an active trial or comped pilot first,
// then the account's (Org) tier, then the workspace's own billing row.
// Code that read WorkspaceBilling.plan directly ignored the free trial and
// pilots, so a trial user was treated as Basic.

import { prisma } from "@/lib/prisma";
import { getEffectivePlan, type PlanConfig } from "@/lib/plans";

export async function getWorkspacePlan(workspaceId: string): Promise<PlanConfig> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { org: true, billing: true },
  });
  return getEffectivePlan(workspace ?? {});
}
