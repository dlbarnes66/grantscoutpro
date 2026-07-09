import { prisma } from "@/lib/prisma";

export async function logActivity(
  workspaceId: string,
  type: string,
  metadata: any = {}
) {
  return prisma.workspaceActivity.create({
    data: {
      workspaceId,
      type,
      metadata,
    },
  });
}
