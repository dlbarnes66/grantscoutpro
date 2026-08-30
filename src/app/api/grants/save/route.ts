import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceMember } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { workspaceId: string } }) {
  const user = await requireUser();
  const { workspaceId } = params;

  await requireWorkspaceMember(workspaceId);

  const body = await req.json();

  if (!body.grantId) {
    return NextResponse.json({ error: "grantId is required." }, { status: 400 });
  }

  // Ensure grant belongs to workspace
  const grant = await prisma.grant.findUnique({
    where: { id: body.grantId },
    select: { workspaceId: true }
  });

  if (!grant || grant.workspaceId !== workspaceId) {
    return NextResponse.json({ error: "Grant does not belong to this workspace." }, { status: 403 });
  }

  const saved = await prisma.savedGrant.create({
    data: {
      userId: user.id,
      grantId: body.grantId
    }
  });

  return NextResponse.json(saved);
}
