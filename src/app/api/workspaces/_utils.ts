import { prisma } from "@/lib/prisma";
import { auth } from "next-auth";
import { NextResponse } from "next/server";

export async function loadWorkspaceContext(workspaceId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      error: NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    };
  }

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

  const membership = workspace.members.find((m) => m.userId === userId);

  if (!membership) {
    return {
      error: NextResponse.json(
        { error: "Forbidden: not a workspace member" },
        { status: 403 }
      )
    };
  }

  return { userId, workspace, membership };
}
