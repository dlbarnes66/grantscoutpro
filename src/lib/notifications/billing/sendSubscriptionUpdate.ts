// src/lib/notifications/billing/sendSubscriptionUpdate.ts

import { prisma } from "@/lib/db";

/**
 * Sends a subscription update notification to all workspace members.
 */
export async function sendSubscriptionUpdate(workspaceId: string, message: string) {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: { userId: true },
  });

  for (const member of members) {
    await prisma.notification.create({
      data: {
        userId: member.userId,
        type: "subscription_update",
        data: { message },
        createdAt: new Date(),
      },
    });
  }
}
