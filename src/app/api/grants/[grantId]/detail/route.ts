import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceMember } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { workspaceId: string, grantId: string } }) {
  const user = await requireUser();
  const { workspaceId, grantId } = params;

  await requireWorkspaceMember(workspaceId);

  const grant = await prisma.grant.findUnique({
    where: { id: grantId }
  });

  if (!grant) {
    return NextResponse.json({ error: "Grant not found." }, { status: 404 });
  }

  return NextResponse.json(grant);
}
