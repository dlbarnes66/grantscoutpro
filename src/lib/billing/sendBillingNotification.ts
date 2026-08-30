// src/lib/billing/sendBillingNotification.ts

import { prisma } from "@/lib/db";

export async function sendBillingNotification(
  workspaceId: string,
  type: string,
  message: string
) {
  try {
    await prisma.billingLog.create({
      data: {
        type,
        message,
        workspace: {
          connect: { id: workspaceId },
        },
      },
    });
  } catch (err) {
    console.error("sendBillingNotification error:", err);
  }
}
