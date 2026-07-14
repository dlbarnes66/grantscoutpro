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

  const { action, payload } = await req.json();

  let result;

  switch (action) {
    case "repairWorkspaceOwner":
      result = await prisma.workspace.update({
        where: { id: payload.workspaceId },
        data: { ownerId: payload.newOwnerId },
      });
      break;

    case "forceRemoveMember":
      result = await prisma.workspaceMember.delete({
        where: {
          workspaceId_userId: {
            workspaceId: payload.workspaceId,
            userId: payload.userId,
          },
        },
      });
      break;

    case "resetGrantAccess":
      result = await prisma.grantAccess.deleteMany({
        where: { grantId: payload.grantId },
      });
      break;

    case "resetDocumentAccess":
      result = await prisma.documentAccess.deleteMany({
        where: { documentId: payload.documentId },
      });
      break;

    case "unlockDocument":
      result = await prisma.document.update({
        where: { id: payload.documentId },
        data: { lockedBy: null },
      });
      break;

    case "clearAIHistory":
      result = await prisma.aiLog.deleteMany({
        where: { workspaceId: payload.workspaceId },
      });
      break;

    case "repairWorkspaceActivity":
      result = await prisma.workspaceActivity.deleteMany({
        where: { workspaceId: payload.workspaceId },
      });
      break;

    default:
      return NextResponse.json({ error: "Unknown emergency action" }, { status: 400 });
  }

  await auditEvent({
    actorId: userId,
    orgId: payload.workspaceId ?? null,
    action: `superadmin.emergency.${action}`,
    entity: "workspace",
    entityId: payload.workspaceId ?? payload.documentId ?? payload.grantId,
    metadata: payload,
  });

  return NextResponse.json({ ok: true, result });
}
