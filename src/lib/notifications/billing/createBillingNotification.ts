// src/lib/notifications/billing/createBillingNotification.ts

import { prisma } from "@/lib/db";

/**
 * Creates a billing notification for all workspace members.
 */
export async function createBillingNotification(
  workspaceId: string,
  type: string,
  message: string
) {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: { userId: true },
  });

  for (const member of members) {
    await prisma.notification.create({
      data: {
        userId: member.userId,
        type,
        data: { message },
        createdAt: new Date(),
      },
    });
  }
}
