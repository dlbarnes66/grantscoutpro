import { prisma } from "@/lib/prisma";

export async function syncStateGrants(workspaceId: string, grants: any[]) {
  for (const grant of grants) {
    await prisma.grant.upsert({
      where: {
        id: grant.raw?.id || grant.title
      },
      update: grant,
      create: {
        id: grant.raw?.id || grant.title,
        ...grant,

        // REQUIRED FIELDS
        workspaceId,
        workspace: {
          connect: { id: workspaceId }
        }
      }
    });
  }
}
