import { prisma } from "@/lib/prisma";

export async function loadSavedGrants(userId: string) {
  const saved = await prisma.savedGrant.findMany({
    where: { userId },
    include: {
      grant: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return saved.map((s) => s.grant);
}
