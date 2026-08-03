import { prisma } from "@/lib/prisma";

/**
 * Log a billing event for auditing and admin visibility.
 */
export async function logBillingEvent(
  event: string,
  message: string,
  workspaceId?: string
) {
  await prisma.billingLog.create({
    data: {
      event,
      message,
      metadata: workspaceId ?? "system",
    },
  });
}
