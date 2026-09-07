import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Ensure a User row exists in our database for the current Clerk session,
 * creating/updating it from the live Clerk profile if needed. Clerk's
 * webhook (which is supposed to keep this table in sync) can't reach
 * localhost in local dev, so without this, every foreign key that points
 * at User (Workspace.ownerId, UserProfile.userId, etc.) fails for anyone
 * whose row was never created.
 */
export async function ensureUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: No Clerk user found.");
  }

  const clerkUser = await currentUser();

  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses?.[0]?.emailAddress ??
    null;

  const name = clerkUser
    ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null
    : null;

  return prisma.user.upsert({
    where: { id: userId },
    update: {
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
      ...(clerkUser?.imageUrl ? { image: clerkUser.imageUrl } : {}),
    },
    create: {
      id: userId,
      email,
      name,
      image: clerkUser?.imageUrl ?? null,
    },
  });
}

/**
 * Require an authenticated Clerk user.
 * Returns the User record from your database, creating it on first
 * sight if this is the first time we've seen this Clerk user.
 */
export async function requireUser() {
  return ensureUser();
}

/**
 * Require that the authenticated user is a member of the workspace.
 * Enforces active membership (status = "active").
 */
export async function requireWorkspaceMember(workspaceId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: No Clerk user found.");
  }

  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
      status: "active",
    },
  });

  if (!member) {
    throw new Error("You do not have access to this workspace.");
  }

  return member;
}

/**
 * Require that the authenticated user is the owner of the workspace.
 */
export async function requireWorkspaceOwner(workspaceId: string) {
  const user = await requireUser();

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerId: true },
  });

  if (!workspace) {
    throw new Error("Workspace not found.");
  }

  if (workspace.ownerId !== user.id) {
    throw new Error("Only the workspace owner can perform this action.");
  }

  return workspace;
}

/**
 * Require that the authenticated user has a seat in the workspace.
 * This is used for seat enforcement in your middleware.
 */
export async function requireActiveSeat(workspaceId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: No Clerk user found.");
  }

  const seat = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
      status: "active",
    },
  });

  if (!seat) {
    throw new Error("You do not have an active seat in this workspace.");
  }

  return seat;
}
