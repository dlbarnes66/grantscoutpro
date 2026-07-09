import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function sendNotification(
  workspaceId: string,
  type: string,
  message: string,
  metadata: any = {}
) {
  const session = await getServerSession();
  const userId = session?.user?.id || null;

  return prisma.workspaceNotification.create({
    data: {
      workspaceId,
      userId,
      type,
      message,
      metadata,
    },
  });
}
