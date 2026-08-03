import { prisma } from "@/lib/prisma";

/**
 * Logs an activity event for a workspace.
 *
 * Expected call signature:
 *   logActivity(workspaceId, action, metadata)
 *
 * Matches the Prisma model:
 *   action: String
 *   metadata: Json?
 *   workspaceId: String
 *   userId: optional
 */
export async function logActivity(
  workspaceId: string,
  action: string,
  metadata: any,
  userId?: string
) {
  await prisma.workspaceActivity.create({
    data: {
      action,
      metadata,
      workspace: {
        connect: { id: workspaceId }
      },
      ...(userId ? { user: { connect: { id: userId } } } : {})
    }
  });
}
