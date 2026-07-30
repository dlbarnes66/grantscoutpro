import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request, { params }: any) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { workspaceId } = params;

  // Fetch workspace
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: true,
      owner: true,
    },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  // Ensure user is a member or owner
  const isMember =
    workspace.ownerId === userId ||
    workspace.members.some((m) => m.userId === userId);

  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(workspace);
}
