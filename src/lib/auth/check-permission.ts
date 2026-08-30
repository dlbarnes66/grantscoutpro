import { resolvePermissions } from "./permissions-engine";

export async function checkPermission(userId: string, workspaceId: string, permission: string) {
  const permissions = await resolvePermissions(userId, workspaceId);
  return permissions.includes(permission);
}
