import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request, { params }: any) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { workspaceId } = params;
  const { email } = await req.json();

  // Load workspace and ensure caller is owner
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  if (workspace.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Create invite record — FIXED FIELD NAME
  const invite = await prisma.workspaceInvite.create({
    data: {
      workspaceId,
      email,
      invitedById: userId,   // ← correct Prisma field
      status: "pending",
    },
  });

  return NextResponse.json(invite);
}
