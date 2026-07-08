import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Resolves the active user + workspace for multi-tenant AI operations.
 *
 * Priority:
 * 1. x-workspace-id header (UI-selected workspace)
 * 2. First workspace the user belongs to (fallback)
 *
 * Validates:
 * - User is authenticated
 * - User belongs to the workspace
 * - Workspace exists
 *
 * Returns:
 * {
 *   userId: string
 *   workspaceId: string
 *   workspace: Workspace
 *   user: User
 * }
 */

export async function resolveContext(req: Request) {
  // 1. Ensure user is authenticated
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Unauthorized: No active session");
  }

  const userId = session.user.id;

  // 2. Fetch all workspaces the user belongs to
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: true },
  });

  if (memberships.length === 0) {
    throw new Error("User is not a member of any workspace");
  }

  // 3. Check for workspace selection via header
  const headerWorkspaceId = req.headers.get("x-workspace-id");

  let activeWorkspaceId: string | null = null;

  if (headerWorkspaceId) {
    const match = memberships.find(
      (m) => m.workspaceId === headerWorkspaceId
    );

    if (!match) {
      throw new Error(
        `User does not belong to workspace ${headerWorkspaceId}`
      );
    }

    activeWorkspaceId = headerWorkspaceId;
  } else {
    // 4. Fallback: first workspace the user belongs to
    activeWorkspaceId = memberships[0].workspaceId;
  }

  // 5. Fetch workspace details
  const workspace = await prisma.workspace.findUnique({
    where: { id: activeWorkspaceId },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  // 6. Fetch user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    userId,
    workspaceId: activeWorkspaceId,
    workspace,
    user,
  };
}
