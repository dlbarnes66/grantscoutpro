import { prisma } from "@/lib/prisma";

export async function loadNarrative(grantId: string, userId: string) {
  const narrative = await prisma.narrative.findFirst({
    where: { grantId, userId },
  });

  return narrative;
}
