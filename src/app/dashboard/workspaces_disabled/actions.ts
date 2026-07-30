import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getUserWorkspaces() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  // Users do NOT have orgId directly.
  // We derive orgId from the workspace membership.
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId },
    select: {
      workspace: {
        select: {
          orgId: true,
        },
      },
    },
  });

  if (!membership?.workspace?.orgId) return null;

  const orgId = membership.workspace.orgId;

  // Fetch all workspaces in the user's org
  const workspaces = await prisma.workspace.findMany({
    where: { orgId },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return workspaces;
}
