import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceOwner } from "@/lib/auth";
import { getPlan, getSeatLimitLabel, isAtSeatLimit } from "@/lib/plans";

export async function POST(req: Request, { params }: { params: { workspaceId: string } }) {
  const user = await requireUser();
  const { workspaceId } = params;

  await requireWorkspaceOwner(workspaceId);

  const body = await req.json();

  if (!body.userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      billing: true,
      members: { where: { status: "active" } },
    },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
  }

  const plan = getPlan(workspace.billing?.plan);

  if (isAtSeatLimit(plan, workspace.members.length)) {
    return NextResponse.json(
      {
        error: `Your ${plan.name} plan is limited to ${getSeatLimitLabel(plan).toLowerCase()}. Upgrade your plan to add more teammates.`,
      },
      { status: 403 }
    );
  }

  const member = await prisma.workspaceMember.create({
    data: {
      workspaceId,
      userId: body.userId,
      role: "member",
      status: "active"
    }
  });

  return NextResponse.json(member);
}
