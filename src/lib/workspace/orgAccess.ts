import { prisma } from "@/lib/prisma";
import { DEFAULT_PLAN_ID } from "@/lib/plans";

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

  const org = await prisma.org.create({
    data: {
      name: user.name ? `${user.name}'s Organization` : "My Organization",
      tier: DEFAULT_PLAN_ID,
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
