import { prisma } from "@/lib/prisma";
import { createNotification } from "./createNotification";

export async function checkNewGrants() {
  const recent = await prisma.grant.findMany({
    where: {
      postedDate: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
    include: { workspace: true },
  });

  for (const g of recent) {
    if (!g.workspace?.ownerId) continue;

    await createNotification({
      userId: g.workspace.ownerId,
      type: "new_grant",
      title: `New Grant Added: ${g.title}`,
      message: `A new grant has been added to your workspace.`,
    });
  }
}
