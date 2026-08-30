import { prisma } from "@/lib/prisma";

export type WorkspaceRole = "MEMBER" | "ADMIN" | "OWNER";

function toWorkspaceRole(role: string | null): WorkspaceRole | null {
  if (role === "MEMBER" || role === "ADMIN" || role === "OWNER") {
    return role;
  }
  return null;
}

export async function getWorkspaceRole(
  userId: string,
  workspaceId: string
): Promise<WorkspaceRole | null> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    select: { role: true },
  });

  return toWorkspaceRole(member?.role ?? null);
}

export function canViewAnalytics(role: WorkspaceRole | null): boolean {
  return role === "ADMIN" || role === "OWNER";
}

export function canViewAdvancedAnalytics(role: WorkspaceRole | null): boolean {
  return role === "OWNER";
}
