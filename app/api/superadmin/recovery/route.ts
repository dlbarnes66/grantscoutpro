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
    case "restoreGrant":
      result = await prisma.grant.update({
        where: { id: payload.grantId },
        data: { deleted: false },
      });
      break;

    case "restoreDocument":
      result = await prisma.document.update({
        where: { id: payload.documentId },
        data: { deleted: false },
      });
      break;

    case "restoreGrantSnapshot":
      const snapshot = await prisma.grantSnapshot.findUnique({
        where: { id: payload.snapshotId },
      });

      if (!snapshot) {
        return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
      }

      result = await prisma.grant.update({
        where: { id: snapshot.grantId },
        data: {
          title: snapshot.title,
          summary: snapshot.summary,
          content: snapshot.content,
        },
      });
      break;

    case "restoreDocumentVersion":
      const version = await prisma.documentVersion.findUnique({
        where: { id: payload.versionId },
      });

      if (!version) {
        return NextResponse.json({ error: "Version not found" }, { status: 404 });
      }

      result = await prisma.document.update({
        where: { id: version.documentId },
        data: {
          content: version.content,
          updatedAt: new Date(),
        },
      });
      break;

    case "rebuildGrantAccess":
      const grant = await prisma.grant.findUnique({
        where: { id: payload.grantId },
        include: { workspace: true },
      });

      if (!grant) {
        return NextResponse.json({ error: "Grant not found" }, { status: 404 });
      }

      const members = await prisma.workspaceMember.findMany({
        where: { workspaceId: grant.workspaceId },
      });

      await prisma.grantAccess.deleteMany({
        where: { grantId: payload.grantId },
      });

      result = await prisma.grantAccess.createMany({
        data: members.map((m) => ({
          grantId: payload.grantId,
          userId: m.userId,
          workspaceId: grant.workspaceId,
        })),
      });
      break;

    case "rebuildDocumentAccess":
      const doc = await prisma.document.findUnique({
        where: { id: payload.documentId },
        include: { workspace: true },
      });

      if (!doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      const docMembers = await prisma.workspaceMember.findMany({
        where: { workspaceId: doc.workspaceId },
      });

      await prisma.documentAccess.deleteMany({
        where: { documentId: payload.documentId },
      });

      result = await prisma.documentAccess.createMany({
        data: docMembers.map((m) => ({
          documentId: payload.documentId,
          userId: m.userId,
          workspaceId: doc.workspaceId,
        })),
      });
      break;

    default:
      return NextResponse.json({ error: "Unknown recovery action" }, { status: 400 });
  }

  await auditEvent({
    actorId: userId,
    orgId: payload.workspaceId ?? null,
    action: `superadmin.recovery.${action}`,
    entity: "recovery",
    entityId: payload.grantId ?? payload.documentId ?? payload.snapshotId ?? payload.versionId,
    metadata: payload,
  });

  return NextResponse.json({ ok: true, result });
}
