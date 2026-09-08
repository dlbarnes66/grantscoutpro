import { prisma } from "@/lib/prisma";
import { getPlan } from "@/lib/plans";

// Federal search access (Grants.gov) is on every plan today - see
// PLANS.*.access.federal in src/lib/plans.ts - so there's no addon for it.
// State and Foundation access follow the same included-at-a-tier-or-buy-it
// pattern as the CRM addon (src/lib/crm/entitlement.ts): a workspace gets
// access either because its plan tier includes that source, or because it
// bought the matching standalone addon.
//
// Note: as of this writing the actual State/Foundation grant-fetching
// (src/lib/grants/state, src/lib/grants/foundations) is still stub code
// pointed at placeholder URLs. This module is the billing/entitlement
// layer only, ready for whichever route ends up doing the real fetching.

async function planIncludesSource(
  workspaceId: string,
  source: "state" | "foundation"
): Promise<boolean> {
  const billing = await prisma.workspaceBilling.findUnique({
    where: { workspaceId },
    select: { plan: true },
  });
  return getPlan(billing?.plan).access[source];
}

async function hasActiveAddon(workspaceId: string, addonType: string): Promise<boolean> {
  const addon = await prisma.workspaceAddon.findFirst({
    where: { workspaceId, addonType, active: true },
    select: { id: true },
  });
  return !!addon;
}

export async function hasStateAccess(workspaceId: string): Promise<boolean> {
  if (!workspaceId) return false;
  if (await planIncludesSource(workspaceId, "state")) return true;
  return hasActiveAddon(workspaceId, "state");
}

export async function hasFoundationAccess(workspaceId: string): Promise<boolean> {
  if (!workspaceId) return false;
  if (await planIncludesSource(workspaceId, "foundation")) return true;
  return hasActiveAddon(workspaceId, "foundations");
}
