import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceOwner } from "@/lib/auth";
import { getPlan, getSeatLimitLabel, isAtSeatLimit } from "@/lib/plans";

export async function POST(req: Request, { params }: { params: { workspaceId: string } }) {
  const admin = await requireUser();
  const { workspaceId } = params;

  await requireWorkspaceOwner(workspaceId);

  const body = await req.json();

  if (!body.email) {
    return NextResponse.json({ error: "email is required." }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      billing: true,
      members: { where: { status: "active" } },
      invites: { where: { status: "pending" } },
    },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
  }

  const plan = getPlan(workspace.billing?.plan);
  const seatsInUse = workspace.members.length + workspace.invites.length;

  if (isAtSeatLimit(plan, seatsInUse)) {
    return NextResponse.json(
      {
        error: `Your ${plan.name} plan is limited to ${getSeatLimitLabel(plan).toLowerCase()}. Upgrade your plan to invite more teammates.`,
      },
      { status: 403 }
    );
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
