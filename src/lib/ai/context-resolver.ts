import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function resolveContext() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      workspaceMembers: {
        include: {
          workspace: true
        }
      }
    }
  });

  if (!user) return null;

  // Pick the user's primary workspace
  const primaryWorkspace = user.workspaceMembers[0]?.workspace;

  return {
    user,
    workspace: primaryWorkspace,
    workspaceId: primaryWorkspace?.id
  };
}
