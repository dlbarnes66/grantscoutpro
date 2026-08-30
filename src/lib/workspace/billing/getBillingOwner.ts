// src/lib/workspace/billing/getBillingOwner.ts

import { prisma } from "@/lib/db";

/**
 * Returns the workspace owner for billing operations.
 */
export async function getBillingOwner(workspaceId: string) {
  return prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      owner: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
}
