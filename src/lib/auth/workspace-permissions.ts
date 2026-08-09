import { prisma } from "@/lib/prisma";
import { auth } from "next-auth";

export async function requireWorkspaceRole(
  workspaceId: string,
  requiredRoles: string | string[]
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: session.user.id
      }
    }
  });

  if (!membership) {
    throw new Error("User is not a member of this workspace");
  }

  const roles = Array.isArray(requiredRoles)
    ? requiredRoles
    : [requiredRoles];

  if (!roles.includes(membership.role)) {
    throw new Error("Insufficient permissions");
  }

  return membership;
}
