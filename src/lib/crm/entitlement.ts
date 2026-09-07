import { prisma } from "@/lib/prisma";

// CRM is included automatically on the Enterprise plan (see
// PLANS.enterprise.access.crm in src/lib/plans.ts). Any other workspace can
// unlock it as a standalone paid addon instead of upgrading their whole
// plan - see /api/workspaces/[id]/addons/crm/checkout.
export async function hasCrmAccess(workspaceId: string): Promise<boolean> {
  if (!workspaceId) return false;

  const billing = await prisma.workspaceBilling.findUnique({
    where: { workspaceId },
    select: { plan: true },
  });

  if (billing?.plan === "enterprise") return true;

  const addon = await prisma.workspaceAddon.findFirst({
    where: { workspaceId, addonType: "crm", active: true },
    select: { id: true },
  });

  return !!addon;
}
