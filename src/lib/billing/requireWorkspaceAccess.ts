import { enforceWorkspaceAccess } from "./enforceWorkspaceAccess";

/**
 * Guard used in API routes to block write operations
 * when a workspace is in read-only mode due to billing.
 */
export async function requireWorkspaceAccess(workspaceId: string) {
  const access = await enforceWorkspaceAccess(workspaceId);

  if (access.readOnly) {
    throw new Error(
      "This workspace is currently in read-only mode due to billing status."
    );
  }

  return access;
}
