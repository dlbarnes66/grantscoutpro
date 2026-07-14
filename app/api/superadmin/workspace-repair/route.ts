import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { isSuperAdmin } from "@/lib/security/super-admin";
import { auditEvent } from "@/lib/audit/log";

export async function POST(req) {
  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isSuperAdmin(userId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action, workspaceId, payload } = await req.json();

  let result;

  switch (action) {
    case "fixMissingOwner":
      result = await prisma.workspace.update({
        where: { id: workspaceId },
        data: { ownerId: payload.newOwnerId },
      });
      break;

    case "fixOrphanedGrants":
      result = await prisma.grant.updateMany({
        where: { workspaceId: null },
        data: { workspaceId },
      });
      break;

    case "fixOrphanedDocuments":
      result = await prisma.document.updateMany({
        where: { workspaceId: null },
        data: { workspaceId },
      });
      break;

    case "clearStuckLocks":
      result = await prisma.document.updateMany({
        where: { workspaceId, lockedBy: { not: null } },
        data: { lockedBy: null },
      });
      break;

    case "repairActivity":
      result = await prisma.workspaceActivity.deleteMany({
        where: { workspaceId },
      });
      break;

    case "repairACL":
      // Remove dangling ACL entries
      await prisma.documentAccess.deleteMany({
        where: { workspaceId, userId: null },
      });
      await prisma.grantAccess.deleteMany({
        where: { workspaceId, userId: null },
      });

      // Remove ACL entries pointing to deleted documents/grants
      await prisma.documentAccess.deleteMany({
        where: {
          workspaceId,
          documentId: { notIn: (await prisma.document.findMany({ where: { workspaceId }, select: { id: true } })).map(d => d.id) }
        }
      });

      await prisma.grantAccess.deleteMany({
        where: {
          workspaceId,
          grantId: { notIn: (await prisma.grant.findMany({ where: { workspaceId }, select: { id: true } })).map(g => g.id) }
        }
      });

      result = { ok: true };
      break;

    default:
      return NextResponse.json({ error: "Unknown repair action" }, { status: 400 });
  }

  await auditEvent({
    actorId: userId,
    orgId: workspaceId,
    action: `superadmin.workspaceRepair.${action}`,
    entity: "workspace",
    entityId: workspaceId,
    metadata: payload,
  });

  return NextResponse.json({ ok: true, result });
}
