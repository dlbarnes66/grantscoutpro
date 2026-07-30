export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { canViewDocument } from "@/lib/security/acl";

export async function GET(req, { params }) {
  const { workspaceId, documentId } = params;

  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ACL: View permission
  const allowed = await canViewDocument(userId, documentId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Load document
  const doc = await prisma.workspaceDocument.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      title: true,
      content: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(doc);
}
