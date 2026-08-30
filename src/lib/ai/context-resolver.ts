import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function resolveContext() {
  const { userId } = await auth();

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      workspaceMembers: {
        include: { workspace: true },
      },
    },
  });

  if (!user) return null;

  const primaryWorkspace = user.workspaceMembers[0]?.workspace ?? null;

  return {
    user,
    profile: user.profile ?? null,
    workspace: primaryWorkspace,
    workspaceId: primaryWorkspace?.id ?? null,
    workspaces: user.workspaceMembers.map((m) => m.workspace),
  };
}
