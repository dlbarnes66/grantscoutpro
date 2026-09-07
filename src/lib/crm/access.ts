import { prisma } from "@/lib/prisma";

/**
 * Confirms the given Clerk user is the owner or an active member of the
 * workspace. Every CRM route is scoped to a single workspace (passed as
 * ?workspaceId= on GET, or in the JSON body on POST/PATCH/DELETE) - this is
 * the one check they all share before touching any CrmContact/CrmDeal data.
 *
 * Returns the membership role ("owner" | "admin" | "member") on success, or
 * null if the workspace doesn't exist or the user has no access to it.
 */
export async function getWorkspaceRole(
  workspaceId: string,
  userId: string
): Promise<"owner" | "admin" | "member" | null> {
  if (!workspaceId || !userId) return null;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      ownerId: true,
      members: { where: { userId, status: "active" }, select: { role: true } },
    },
  });

  if (!workspace) return null;
  if (workspace.ownerId === userId) return "owner";

  const member = workspace.members[0];
  if (!member) return null;

  return member.role === "admin" ? "admin" : "member";
}
