import { prisma } from "@/lib/prisma";

export async function auditEvent({
  actorId,
  orgId,
  action,
  entity,
  entityId,
  metadata,
}: {
  actorId: string;
  orgId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: any;
}) {
  return prisma.auditLog.create({
    data: {
      actorId,
      orgId,
      action,
      entity,
      entityId,
      metadata,
    },
  });
}
