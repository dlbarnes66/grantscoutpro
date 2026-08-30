import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function resolveContext() {
  const { userId, sessionId } = await auth();

  if (!userId) {
    return {
      user: null,
      userId: null,
      sessionId: null,
      org: null,
      workspaces: [],
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  const workspaceMemberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: true },
  });

  return {
    user,
    userId,
    sessionId,
    org: null, // removed orgMember (does not exist in schema)
    workspaces: workspaceMemberships.map((m) => ({
      ...m.workspace,
      role: m.role,
    })),
  };
}
