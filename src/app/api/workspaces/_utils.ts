import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Load workspace context:
 * - Validates Clerk authentication
 * - Ensures workspace exists
 * - Ensures user is a member
 * Returns: { userId, workspace, membership }
 */
export async function loadWorkspaceContext(workspaceId: string) {
  // Authenticate user
  const { userId } = await auth();
  if (!userId) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    };
  }

  // Fetch workspace
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: true
    }
  });

  if (!workspace) {
    return {
      error: NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      )
    };
  }

  // Check membership
  const membership = workspace.members.find((m) => m.userId === userId);

  if (!membership) {
    return {
      error: NextResponse.json(
        { error: "Forbidden: not a workspace member" },
        { status: 403 }
      )
    };
  }

  // Success
  return { userId, workspace, membership };
}
