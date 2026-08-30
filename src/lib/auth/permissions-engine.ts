// src/lib/auth/permissions-engine.ts
import { prisma } from "@/lib/db";
import { ROLE_PERMISSIONS } from "./role-map";

export async function resolvePermissions(userId: string, workspaceId: string) {
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId, workspaceId },
  });

  const role = membership?.role ?? "viewer";
  return ROLE_PERMISSIONS[role] ?? [];
}
