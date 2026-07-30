export const dynamic = "force-dynamic";

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

  // Fetch all documents in workspace
  const docs = await prisma.workspaceDocument.findMany({
    where: { workspaceId },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  // Fetch ACL entries for this user
  const acl = await prisma.documentAccess.findMany({
    where: {
      userId: auth.userId,
    },
    select: {
      documentId: true,
      canView: true,
    },
  });

  const allowedIds = new Set(
    acl.filter(a => a.canView).map(a => a.documentId)
  );

  // Filter documents by ACL
  const visibleDocs = docs.filter(doc => allowedIds.has(doc.id));

  return NextResponse.json(visibleDocs);
}
