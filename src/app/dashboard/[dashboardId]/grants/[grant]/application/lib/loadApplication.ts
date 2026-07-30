import { prisma } from "@/lib/prisma";

export async function loadApplication(grantId: string, userId: string) {
  const application = await prisma.application.findFirst({
    where: { grantId, userId },
    include: { versions: true },
  });

  return application;
}
