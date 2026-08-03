import { prisma } from "@/lib/prisma";

// VIEW PERMISSION
export async function canViewGrant(userId: string, grantId: string) {
  const access = await prisma.grantAccess.findUnique({
    where: {
      grantId_userId: {
        grantId,
        userId
      }
    }
  });

  return access?.canView ?? false;
}

// EDIT PERMISSION
export async function canEditGrant(userId: string, grantId: string) {
  const access = await prisma.grantAccess.findUnique({
    where: {
      grantId_userId: {
        grantId,
        userId
      }
    }
  });

  return access?.canEdit ?? false;
}

// AI PERMISSION (RUN AI ON GRANT)
export async function canRunGrantAI(userId: string, grantId: string) {
  const access = await prisma.grantAccess.findUnique({
    where: {
      grantId_userId: {
        grantId,
        userId
      }
    }
  });

  return access?.canRunAI ?? false;
}

// REQUIRE AI PERMISSION (THROW IF NOT ALLOWED)
export async function requireGrantAI(userId: string, grantId: string) {
  const allowed = await canRunGrantAI(userId, grantId);
  if (!allowed) {
    throw new Error("User does not have permission to run AI on this grant.");
  }
}

// FILTER GRANTS BY VIEW PERMISSION
export async function filterViewableGrants(userId: string, grantIds: string[]) {
  const accessList = await prisma.grantAccess.findMany({
    where: {
      userId,
      grantId: { in: grantIds }
    }
  });

  const allowed = new Set(
    accessList.filter(a => a.canView).map(a => a.grantId)
  );

  return grantIds.filter(id => allowed.has(id));
}
