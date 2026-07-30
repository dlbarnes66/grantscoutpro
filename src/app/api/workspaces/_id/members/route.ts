export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

// ⭐ GET — list workspace members
export async function GET(req, { params }) {
  const { workspaceId } = params;
  const auth = getAuth(req);

  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure requester is a workspace member
  const requester = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: auth.userId,
      },
    },
  });

  if (!requester) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: {
      id: true,
      userId: true,
      role: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return NextResponse.json(members);
}

// ⭐ POST — add or update a workspace member (ADMIN only)
export async function POST(req, { params }) {
  const { workspaceId } = params;
  const auth = getAuth(req);

  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure requester is ADMIN or OWNER
  const requester = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: auth.userId,
      },
    },
  });

  if (!requester || requester.role === "member") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { targetUserId, role } = await req.json();

  const updated = await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: targetUserId,
      },
    },
    update: {
      role: role?.toUpperCase() ?? "MEMBER",
    },
    create: {
      workspaceId,
      userId: targetUserId,
      role: role?.toUpperCase() ?? "MEMBER",
    },
  });

  return NextResponse.json(updated);
}
