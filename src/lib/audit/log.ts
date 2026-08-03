import { prisma } from "@/lib/prisma";

/**
 * Writes an audit log entry.
 * Exported as `auditEvent` because multiple routes depend on that name.
 */
export async function auditEvent({
  actorId,
  orgId,
  action,
  entity,
  metadata = {}
}: {
  actorId: string;
  orgId: string | null;
  action: string;
  entity: string;
  metadata?: Record<string, any>;
}) {
  return prisma.auditLog.create({
    data: {
      orgId,
      action,
      metadata: {
        actorId,
        entity,
        ...metadata
      }
    }
  });
}
