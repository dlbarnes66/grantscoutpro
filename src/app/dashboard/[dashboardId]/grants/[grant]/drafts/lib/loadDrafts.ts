import { prisma } from "@/lib/prisma";

export async function loadDrafts(grantId: string, userId: string) {
  const drafts = await prisma.grantDraft.findMany({
    where: { grantId, userId },
    orderBy: { updatedAt: "desc" },
  });

  return drafts;
}
