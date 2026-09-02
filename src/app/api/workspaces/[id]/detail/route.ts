import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceMember } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { workspaceId: string } }) {
  const user = await requireUser();
  const { workspaceId } = params;

  await requireWorkspaceMember(workspaceId);

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      id: true,
      name: true,
      slug: true,
      suspended: true,
      suspendedAt: true,
      createdAt: true,
      ownerId: true,
      billing: {
        select: {
          plan: true,
          seats: true,
          aiTokensMonthly: true,
          aiTokensUsed: true,
          documentLimit: true,
          storageLimitMb: true
        }
      }
    }
  });

  return NextResponse.json(workspace);
}
