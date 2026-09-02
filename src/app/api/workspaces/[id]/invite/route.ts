import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceOwner } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { workspaceId: string } }) {
  const admin = await requireUser();
  const { workspaceId } = params;

  await requireWorkspaceOwner(workspaceId);

  const body = await req.json();

  if (!body.email) {
    return NextResponse.json({ error: "email is required." }, { status: 400 });
  }

  const invite = await prisma.workspaceInvite.create({
    data: {
      workspaceId,
      email: body.email,
      invitedById: admin.id,
      status: "pending"
    }
  });

  return NextResponse.json(invite);
}
