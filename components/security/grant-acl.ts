import { prisma } from "@/lib/prisma";

/**
 * Ensures the user has access to AI features for a specific grant.
 * Access is granted if a GrantAccess record exists for (userId, grantId).
 */
export async function requireGrantAI(userId: string, grantId: string) {
  const access = await prisma.grantAccess.findUnique({
    where: {
      grantId_userId: {
        grantId,
        userId,
      },
    },
  });

  return access !== null;
}
