import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceOwner } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { workspaceId: string } }) {
  const user = await requireUser();
  const { workspaceId } = params;

  await requireWorkspaceOwner(workspaceId);

  const body = await req.json();

  if (!body.userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  await prisma.workspaceMember.deleteMany({
    where: {
      workspaceId,
      userId: body.userId
    }
  });

  return NextResponse.json({ success: true });
}
