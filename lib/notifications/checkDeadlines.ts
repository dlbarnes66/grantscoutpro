import { prisma } from "@/lib/prisma";
import { createNotification } from "./createNotification";

export async function checkDeadlines() {
  const grants = await prisma.grant.findMany({
    where: { deadline: { not: null } },
    include: { workspace: true },
  });

  const now = Date.now();

  for (const g of grants) {
    if (!g.workspace?.ownerId || !g.deadline) continue;

    const daysLeft = Math.floor(
      (new Date(g.deadline).getTime() - now) / 86400000
    );

    if ([7, 3, 1].includes(daysLeft)) {
      await createNotification({
        userId: g.workspace.ownerId,
        type: "deadline",
        title: `Deadline Approaching: ${g.title}`,
        message: `This grant deadline is in ${daysLeft} day(s).`,
      });
    }
  }
}
