import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Require an authenticated Clerk user.
 * Returns the User record from your database.
 */
export async function requireUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: No Clerk user found.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found in database.");
  }

  return user;
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
 * Require that the workspace is not suspended.
 */
export async function requireWorkspaceNotSuspended(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { suspended: true, suspendedAt: true },
  });

  if (!workspace) {
    throw new Error("Workspace not found.");
  }

  if (workspace.suspended) {
    throw new Error(
      `Workspace is suspended as of ${workspace.suspendedAt || "unknown date"}.`
    );
  }

  return workspace;
}

/**
 * Require that the authenticated user has an active seat in the workspace.
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

/**
 * Require billing limits for AI usage, documents, storage, etc.
 */
export async function requireBillingLimits(workspaceId: string) {
  const billing = await prisma.workspaceBilling.findFirst({
    where: { workspaceId },
  });

  if (!billing) {
    throw new Error("Billing record not found for workspace.");
  }

  return billing;
}
