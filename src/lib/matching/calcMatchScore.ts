import { prisma } from "@/lib/prisma";

/**
 * Calculates a match score between a grant and a user/workspace.
 * Score range: 0.0 – 1.0
 */
export async function calcMatchScore(
  grant: any,
  userId: string | null,
  workspaceId: string | null
): Promise<number> {
  let score = 0;

  // 1. Workspace relevance
  if (workspaceId && grant.workspaceId === workspaceId) {
    score += 0.4;
  }

  // 2. Saved grants relevance
  if (userId) {
    const saved = await prisma.savedGrant.findFirst({
      where: { userId, grantId: grant.id },
    });

    if (saved) {
      score += 0.3;
    }
  }

  // 3. Location relevance (schema-aligned replacement for category)
  if (workspaceId) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (workspace && workspace.state && grant.location) {
      if (workspace.state.toLowerCase() === grant.location.toLowerCase()) {
        score += 0.2;
      }
    }
  }

  // 4. Funding relevance
  if (grant.amountMax && grant.amountMax > 0) {
    score += 0.1;
  }

  // Clamp score between 0 and 1
  return Math.min(score, 1);
}
