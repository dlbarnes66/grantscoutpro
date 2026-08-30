import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function checkWorkspacePermission(workspaceId: string) {
  const { userId } = await auth(); // ✔ FIXED

  if (!userId) {
    return { allowed: false, role: null };
  }

  // Workspace membership
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId, workspaceId },
  });

  if (membership) {
    return {
      allowed: true,
      role: membership.role,
    };
  }

  // ❌ Removed orgAdmin logic — orgMember does NOT exist in your schema

  return { allowed: false, role: null };
}
