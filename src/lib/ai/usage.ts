import { prisma } from "@/lib/prisma";

export async function recordAiUsage(
  workspaceId: string,
  userId: string | null,
  feature: string,
  tokens: number,
  cost: number
) {
  await prisma.aiUsage.create({
    data: {
      workspaceId,
      userId,
      feature,
      tokens,
      cost
    }
  });
}
