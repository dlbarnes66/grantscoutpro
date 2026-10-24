import { prisma } from "@/lib/prisma";
import { DEFAULT_PLAN_ID, TRIAL_DAYS, TRIAL_TIER } from "@/lib/plans";

// Every workspace-owning user belongs to exactly one Org, which is what
// plans actually attach to (see resolveEffectivePlanId in @/lib/plans) -
// a customer on Team can run up to 3 workspaces, all sharing that Org's
// tier. Most users created before this existed have no Org yet, so this
// creates one on first use rather than requiring a separate migration
// step or a signup-flow change.
export async function ensureUserOrg(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { Org: true },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.Org) {
    return user.Org;
  }

  // New accounts start on a free trial of the top self-serve plan. Stored as
  // a pilot so the effective-plan logic needs no special case: when
  // pilotEndsAt passes, the account falls back to tier (Basic) on its own.
  const trialStart = new Date();
  const trialEnd = new Date(trialStart.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

  const org = await prisma.org.create({
    data: {
      name: user.name ? `${user.name}'s Organization` : "My Organization",
      tier: DEFAULT_PLAN_ID,
      pilotTier: TRIAL_TIER,
      pilotStart: trialStart,
      pilotEndsAt: trialEnd,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { orgId: org.id },
  });

  return org;
}

// Workspaces created before Org-level billing existed have orgId: null.
// Counting by ownerId (rather than orgId) means a workspace that hasn't
// been backfilled onto the org yet still counts against that owner's
// limit, instead of letting them slip past it for free.
export async function countWorkspacesForOwner(ownerId: string): Promise<number> {
  return prisma.workspace.count({ where: { ownerId } });
}
