import { prisma } from "@/lib/prisma";

/**
 */
export async function logBillingEvent(
  message: string,
  workspaceId?: string
) {
  await prisma.billingLog.create({
    data: {
      message,
      metadata: workspaceId ?? "system",
    },
  });
}
