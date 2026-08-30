// src/lib/notifications/billing/sendPaymentFailure.ts

import { prisma } from "@/lib/db";

/**
 * Sends a payment failure alert to all workspace members.
 */
export async function sendPaymentFailure(workspaceId: string, message: string) {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: { userId: true },
  });

  for (const member of members) {
    await prisma.notification.create({
      data: {
        userId: member.userId,
        type: "payment_failure",
        data: { message },
        createdAt: new Date(),
      },
    });
  }
}

