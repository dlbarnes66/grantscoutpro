import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceMember } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { workspaceId: string } }) {
  const user = await requireUser();
  const { workspaceId } = params;

  await requireWorkspaceMember(workspaceId);

  // Get saved grants for this workspace
  const saved = await prisma.savedGrant.findMany({
    where: { userId: user.id },
    select: { grantId: true }
  });

  const savedIds = saved.map(s => s.grantId);

  // Recommend grants not yet saved
  const recommendations = await prisma.grant.findMany({
    where: {
      workspaceId,
      id: { notIn: savedIds }
    },
    take: 20
  });

  return NextResponse.json(recommendations);
}
