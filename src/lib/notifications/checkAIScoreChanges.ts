import { prisma } from "@/lib/prisma";
import { createNotification } from "./createNotification";

export async function checkAIScoreChanges() {
  const grants = await prisma.grant.findMany({
    where: {},
    include: { workspace: true },
  });

  for (const g of grants) {
    if (!g.workspace?.ownerId) continue;

    if (g.aiRiskScore && g.aiRiskScore > 80) {
      await createNotification({
        userId: g.workspace.ownerId,
        type: "ai_change",
        title: `High AI Risk Score: ${g.title}`,
        message: `AI detected elevated risk for this grant.`,
      });
    }
  }
}
