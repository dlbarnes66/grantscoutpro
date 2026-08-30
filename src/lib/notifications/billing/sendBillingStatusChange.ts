// src/lib/notifications/billing/sendBillingStatusChange.ts

import { prisma } from "@/lib/db";

/**
 * Sends a billing status change notification to all workspace members.
 */
export async function sendBillingStatusChange(workspaceId: string, status: string) {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: { userId: true },
  });

  for (const member of members) {
    await prisma.notification.create({
      data: {
        userId: member.userId,
        type: "billing_status_change",
        data: { status },
        createdAt: new Date(),
      },
    });
  }
}
