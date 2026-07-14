import { prisma } from "@/lib/prisma";

export async function getWorkspaceRole(userId: string, workspaceId: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    select: { role: true },
  });

  return member?.role ?? null;
}

export function canManageMembers(role: string) {
  return role === "ADMIN" || role === "OWNER";
}

export function canManageWorkspace(role: string) {
  return role === "OWNER";
}

export function canViewAnalytics(role: string) {
  return role === "ADMIN" || role === "OWNER";
}
