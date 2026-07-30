export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { canViewDocument, canEditDocument } from "@/lib/security/acl";

// ⭐ GET → Load document (requires canViewDocument)
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
    },
  });

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(doc);
}

// ⭐ POST → Save document (requires canEditDocument)
export async function POST(req, { params }) {
  const { workspaceId, documentId } = params;

  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ACL: Edit permission
  const allowed = await canEditDocument(userId, documentId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, content } = await req.json();

  // Update document
  const updated = await prisma.workspaceDocument.update({
    where: { id: documentId },
    data: {
      title,
      content,
    },
    select: {
      id: true,
      title: true,
      content: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(updated);
}
