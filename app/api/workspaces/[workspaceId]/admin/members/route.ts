import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { getWorkspaceRole, canManageMembers } from "@/lib/security/workspace-acl";
import { auditEvent } from "@/lib/audit/log";

export async function GET(req, { params }) {
  const { workspaceId } = params;
  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getWorkspaceRole(userId, workspaceId);
  if (!canManageMembers(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(members);
}

export async function POST(req, { params }) {
  const { workspaceId } = params;
  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getWorkspaceRole(userId, workspaceId);
  if (!canManageMembers(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { targetUserId, newRole } = await req.json();

  const updated = await prisma.workspaceMember.update({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: targetUserId,
      },
    },
    data: { role: newRole },
  });

  await auditEvent({
    actorId: userId,
    orgId: workspaceId,
    action: "workspace.role.update",
    entity: "member",
    entityId: targetUserId,
    metadata: { newRole },
  });

  return NextResponse.json(updated);
}
