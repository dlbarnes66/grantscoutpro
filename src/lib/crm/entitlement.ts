import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plans";

// CRM is included automatically on the Enterprise plan (see
// PLANS.enterprise.access.crm in src/lib/plans.ts). Any other workspace can
// unlock it as a standalone paid addon instead of upgrading their whole
// plan - see /api/workspaces/[id]/addons/crm/checkout.
export async function hasCrmAccess(workspaceId: string): Promise<boolean> {
  if (!workspaceId) return false;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { billing: { select: { plan: true } }, org: { select: { tier: true } } },
  });

  if (!workspace) return false;

  const plan = getEffectivePlan(workspace);
  if (plan.access.crm) return true;

  const addon = await prisma.workspaceAddon.findFirst({
    where: { workspaceId, addonType: "crm", active: true },
    select: { id: true },
  });

  return !!addon;
}
