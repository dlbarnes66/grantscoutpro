import { prisma } from "@/lib/prisma";

/**
 * Send a billing-related notification to a workspace.
 * This is used for:
 * - past_due warnings
 * - renewal reminders
 * - seat limit warnings
 * - add-on changes
 * - workspace lock/unlock events
 */
export async function sendBillingNotification(
  workspaceId: string,
  message: string
) {
  await prisma.workspaceNotification.create({
    data: {
      workspaceId,
      type: "billing",
      message,
    },
  });
}
