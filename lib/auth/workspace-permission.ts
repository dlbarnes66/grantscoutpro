import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function requireWorkspaceRole(
  workspaceId: string,
  allowedRoles: string[]
) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: session.user.id,
    },
  });

  if (!member) {
    throw new Error("Not a workspace member");
  }

  if (!allowedRoles.includes(member.role)) {
    throw new Error("Insufficient permissions");
  }

  return member;
}
