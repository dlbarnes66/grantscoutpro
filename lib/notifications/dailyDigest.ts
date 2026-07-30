import { prisma } from "@/lib/prisma";
import { createNotification } from "./createNotification";

export async function dailyDigest(userId: string, workspaceId: string) {
  const newGrants = await prisma.grant.findMany({
    where: {
      workspaceId,
      postedDate: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
  });

  const deadlines = await prisma.grant.findMany({
    where: {
      workspaceId,
      deadline: {
        gte: new Date(),
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const message = `
New grants: ${newGrants.length}
Deadlines in next 7 days: ${deadlines.length}
  `.trim();

  await createNotification({
    userId,
    type: "digest",
    title: "Daily Grant Digest",
    message,
  });
}
