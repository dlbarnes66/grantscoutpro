// src/lib/notifications/billing/sendUsageWarning.ts

import { prisma } from "@/lib/db";

/**
 * Sends a usage warning notification to all workspace members.
 */
export async function sendUsageWarning(workspaceId: string, message: string) {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: { userId: true },
  });

  for (const member of members) {
    await prisma.notification.create({
      data: {
        userId: member.userId,
        type: "usage_warning",
        data: { message },
        createdAt: new Date(),
      },
    });
  }
}
