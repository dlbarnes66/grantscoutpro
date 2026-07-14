import { prisma } from "@/lib/prisma";

export async function canViewGrant(userId: string, grantId: string) {
  const access = await prisma.grantAccess.findUnique({
    where: {
      grantId_userId: {
        grantId,
        userId,
      },
    },
  });

  return access?.canView ?? false;
}

export async function canEditGrant(userId: string, grantId: string) {
  const access = await prisma.grantAccess.findUnique({
    where: {
      grantId_userId: {
        grantId,
        userId,
      },
    },
  });

  return access?.canEdit ?? false;
}

export async function canRunGrantAI(userId: string, grantId: string) {
  const access = await prisma.grantAccess.findUnique({
    where: {
      grantId_userId: {
        grantId,
        userId,
      },
    },
  });

  return access?.canRunAI ?? false;
}

export async function requireGrantAI(userId: string, grantId: string) {
  return await canRunGrantAI(userId, grantId);
}

export async function filterViewableGrants(userId: string, grantIds: string[]) {
  const accessList = await prisma.grantAccess.findMany({
    where: {
      userId,
      grantId: { in: grantIds },
      canView: true,
    },
    select: { grantId: true },
  });

  return new Set(accessList.map(a => a.grantId));
}
