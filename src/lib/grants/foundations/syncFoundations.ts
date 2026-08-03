import { prisma } from "@/lib/prisma";

export async function syncFoundations(workspaceId: string, foundations: any[]) {
  for (const grant of foundations) {
    await prisma.grant.upsert({
      where: {
        id: grant.foundationEIN || grant.title
      },
      update: grant,
      create: {
        id: grant.foundationEIN || grant.title,
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
