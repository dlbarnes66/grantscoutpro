import { prisma } from "@/lib/prisma";

export async function sendNotification({
  workspaceId,
  userId,
  type,
  message
}: {
  workspaceId: string;
  userId?: string;
  type: string;
  message: string;
}) {
  await prisma.workspaceNotification.create({
    data: {
      workspaceId,
      userId,
      type,
      message
    }
  });
}
