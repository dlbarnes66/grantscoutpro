// src/lib/notifications/billing/sendTrialExpiration.ts

import { prisma } from "@/lib/db";

/**
 * Sends a trial expiration alert to all workspace members.
 */
export async function sendTrialExpiration(workspaceId: string, message: string) {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: { userId: true },
  });

  for (const member of members) {
    await prisma.notification.create({
      data: {
        userId: member.userId,
        type: "trial_expiration",
        data: { message },
        createdAt: new Date(),
      },
    });
  }
}
