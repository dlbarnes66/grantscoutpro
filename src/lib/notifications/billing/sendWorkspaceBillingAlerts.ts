// src/lib/notifications/billing/sendWorkspaceBillingAlert.ts

import { prisma } from "@/lib/db";

/**
 * Sends a billing alert to all workspace members.
 */
export async function sendWorkspaceBillingAlert(
  workspaceId: string,
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
        type: "billing_alert",
        data: { message },
        createdAt: new Date(),
      },
    });
  }
}
