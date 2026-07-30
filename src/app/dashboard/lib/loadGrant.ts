import { prisma } from "@/lib/prisma";

export async function loadGrant(workspaceId: string, grantId: string) {
  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
    include: {
      GrantSection: true,
      GrantDraft: true,
      narratives: true,
      documents: true,
    },
  });

  if (!grant) {
    throw new Error("Grant not found");
  }

  if (grant.workspaceId !== workspaceId) {
    throw new Error("Grant does not belong to this workspace");
  }

  return grant;
}
