import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

// ⭐ GET — list ACL entries
export async function GET(req, { params }) {
  const { workspaceId, documentId } = params;
  const auth = getAuth(req);

  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only workspace members can manage ACL
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: auth.userId,
      },
    },
  });

  if (!member || member.role === "member") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const acl = await prisma.documentAccess.findMany({
    where: { documentId },
    select: {
      id: true,
      userId: true,
      canView: true,
      canEdit: true,
      canRunAI: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json(acl);
}

// ⭐ POST — add or update ACL entry
export async function POST(req, { params }) {
  const { workspaceId, documentId } = params;
  const auth = getAuth(req);

  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: auth.userId,
      },
    },
  });

  if (!member || member.role === "member") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { targetUserId, canView, canEdit, canRunAI } = await req.json();

  const updated = await prisma.documentAccess.upsert({
    where: {
      documentId_userId: {
        documentId,
        userId: targetUserId,
      },
    },
    update: {
      canView,
      canEdit,
      canRunAI,
    },
    create: {
      documentId,
      userId: targetUserId,
      canView,
      canEdit,
      canRunAI,
    },
  });

  return NextResponse.json(updated);
}

// ⭐ DELETE — remove ACL entry
export async function DELETE(req, { params }) {
  const { workspaceId, documentId } = params;
  const auth = getAuth(req);

  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: auth.userId,
      },
    },
  });

  if (!member || member.role === "member") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { targetUserId } = await req.json();

  await prisma.documentAccess.delete({
    where: {
      documentId_userId: {
        documentId,
        userId: targetUserId,
      },
    },
  });

  return NextResponse.json({ success: true });
}
