import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req, { params }) {
  const { workspaceId } = params;
  const auth = getAuth(req);

  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure user is a workspace member
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: auth.userId,
      },
    },
  });

  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch all grants in workspace
  const grants = await prisma.grant.findMany({
    where: { workspaceId },
    select: {
      id: true,
      title: true,
      agency: true,
      deadline: true,
      updatedAt: true,
    },
  });

  // Fetch ACL entries for this user
  const acl = await prisma.grantAccess.findMany({
    where: {
      userId: auth.userId,
    },
    select: {
      grantId: true,
      canView: true,
    },
  });

  const allowedIds = new Set(
    acl.filter(a => a.canView).map(a => a.grantId)
  );

  // Filter grants by ACL
  const visibleGrants = grants.filter(grant => allowedIds.has(grant.id));

  return NextResponse.json(visibleGrants);
}
