// app/api/workspace/addUser/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { canAddUser } from "../../../../lib/userLimits";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId, userEmail } = await req.json();

  if (!workspaceId || !userEmail) {
    return NextResponse.json(
      { error: "Missing workspaceId or userEmail" },
      { status: 400 }
    );
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { users: true },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  if (!canAddUser(workspace)) {
    return NextResponse.json(
      { error: "User limit reached for this workspace" },
      { status: 403 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.workspaceUser.create({
    data: {
      workspaceId,
      userId: user.id,
      role: "member",
    },
  });

  return NextResponse.json({ success: true });
}
