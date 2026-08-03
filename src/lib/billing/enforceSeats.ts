import { prisma } from "@/lib/prisma";

/**
 * Enforce seat limits for a workspace.
 * Called before adding a new member to a workspace.
 */
export async function enforceSeats(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      maxSeats: true,
      currentSeats: true,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found.");
  }

  const { maxSeats, currentSeats } = workspace;

  // If workspace is at or above seat limit → block
  if (currentSeats >= maxSeats) {
    throw new Error(
      `Seat limit exceeded. This workspace has ${currentSeats} of ${maxSeats} seats filled.`
    );
  }
}
