import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { getWorkspaceRole, canManageMembers } from "@/lib/security/workspace-acl";
import { auditEvent } from "@/lib/audit/log";

export async function POST(req, { params }) {
  const { workspaceId } = params;
  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getWorkspaceRole(userId, workspaceId);
  if (!canManageMembers(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { targetUserId, grantId, documentId, field, value } = await req.json();

  let updated;

  if (grantId) {
    updated = await prisma.grantAccess.update({
      where: {
        grantId_userId: {
          grantId,
          userId: targetUserId,
        },
      },
      data: { [field]: value },
    });
  }

  if (documentId) {
    updated = await prisma.documentAccess.update({
      where: {
        documentId_userId: {
          documentId,
          userId: targetUserId,
        },
      },
      data: { [field]: value },
    });
  }

  await auditEvent({
    actorId: userId,
    orgId: workspaceId,
    action: "workspace.permission.update",
    entity: grantId ? "grant" : "document",
    entityId: grantId ?? documentId,
    metadata: { field, value },
  });

  return NextResponse.json(updated);
}
