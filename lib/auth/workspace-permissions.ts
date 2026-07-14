import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// Explicit named export
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

export async function assertWorkspaceMember(workspaceId: string, userId: string) {
  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId },
  });

  if (!member) {
    throw new Error("Not a member of this workspace");
  }

  return member;
}

export async function assertWorkspaceAdmin(workspaceId: string, userId: string) {
  const member = await assertWorkspaceMember(workspaceId, userId);

  if (member.role !== "ADMIN") {
    throw new Error("Admin privileges required");
  }

  return member;
}

export async function canManageMembers(workspaceId: string, userId: string) {
  const member = await assertWorkspaceMember(workspaceId, userId);
  return member.role === "ADMIN";
}
