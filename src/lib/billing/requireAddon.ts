import { prisma } from "@/lib/prisma";

/**
 * Require a specific add-on (crm, foundations, state, seats).
 * Throws an error if the workspace does not have the add-on active.
 */
export async function requireAddon(workspaceId: string, addonType: string) {
  const addon = await prisma.workspaceAddon.findFirst({
    where: {
      workspaceId,
      addonType,
      active: true,
    },
  });

  if (!addon) {
    throw new Error(
      `The '${addonType}' add-on is not enabled for this workspace.`
    );
  }
}
