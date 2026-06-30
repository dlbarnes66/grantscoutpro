import { prisma } from "@/lib/prisma";
import { fieldDiff } from "./fieldDiff";

export async function auditLog({
  actorId,
  orgId,
  action,
  entity,
  before,
  after,
  ip,
  userAgent,
}: {
  actorId: string;
  orgId?: string;
  action: string;
  entity: string;
  before: any;
  after: any;
  ip?: string;
  userAgent?: string;
}) {
  const changes = fieldDiff(before, after);

  await prisma.auditLog.create({
    data: {
      actorId,
      orgId,
      action,
      entity,
      before: JSON.stringify(before),
      after: JSON.stringify(after),
      changes: JSON.stringify(changes),
      ip,
      userAgent,
    },
  });

  return changes;
}
