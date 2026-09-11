import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plans";
import { getEffectiveTaskStatus } from "@/lib/tasks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = Promise<{ id: string; taskId: string }>;

const TASK_INCLUDE = {
  assignedTo: { select: { id: true, name: true, email: true } },
  assignedBy: { select: { id: true, name: true, email: true } },
} as const;

const VALID_STATUSES = ["NEW", "IN_PROGRESS", "COMPLETED"];

async function loadWorkspaceForMember(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: { where: { status: "active" } },
      billing: true,
      org: true,
    },
  });
  if (!workspace) return null;

  const isMember =
    workspace.ownerId === userId ||
    workspace.members.some((m) => m.userId === userId);
  if (!isMember) return null;

  return workspace;
}

// PATCH - update status, reassign, edit title/description/due date.
// Any active workspace member can update a task (small-team collaboration);
// reassigning still requires the new assignee to be a member.
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, taskId } = await params;
    const workspace = await loadWorkspaceForMember(id, userId);
    if (!workspace) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const plan = getEffectivePlan(workspace);
    if (!plan.access.tasks) {
      return NextResponse.json(
        { error: "Task assignments are available on the Team, Business, and Enterprise plans." },
        { status: 403 }
      );
    }

    const existing = await prisma.workspaceTask.findFirst({
      where: { id: taskId, workspaceId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Missing request body" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      data.status = body.status;
    }

    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      data.title = title;
    }

    if (body.description !== undefined) {
      data.description = body.description ? String(body.description).trim() : null;
    }

    if (body.dueDate !== undefined) {
      if (!body.dueDate) {
        data.dueDate = null;
      } else {
        const parsed = new Date(body.dueDate);
        if (Number.isNaN(parsed.getTime())) {
          return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });
        }
        data.dueDate = parsed;
      }
    }

    let reassignedTo: string | null = null;
    if (body.assigneeId !== undefined && body.assigneeId !== existing.assignedToId) {
      const assigneeIsMember =
        workspace.ownerId === body.assigneeId ||
        workspace.members.some((m) => m.userId === body.assigneeId);
      if (!assigneeIsMember) {
        return NextResponse.json(
          { error: "Assignee must be a member of this workspace." },
          { status: 400 }
        );
      }
      data.assignedToId = body.assigneeId;
      reassignedTo = body.assigneeId;
    }

    const updated = await prisma.workspaceTask.update({
      where: { id: taskId },
      data,
      include: TASK_INCLUDE,
    });

    if (reassignedTo && reassignedTo !== userId) {
      const actor = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });
      const actorName = actor?.name || actor?.email || "A teammate";

      await prisma.workspaceNotification.create({
        data: {
          workspaceId: id,
          userId: reassignedTo,
          type: "task_assigned",
          message: `${actorName} assigned you a task: "${updated.title}"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      task: { ...updated, effectiveStatus: getEffectiveTaskStatus(updated.status, updated.dueDate) },
    });
  } catch (err: any) {
    console.error("WORKSPACE TASK PATCH ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

// DELETE - only the person who assigned the task or the workspace owner
// can remove it, so an assignee can't quietly make an unwanted task vanish.
export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, taskId } = await params;
    const workspace = await loadWorkspaceForMember(id, userId);
    if (!workspace) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.workspaceTask.findFirst({
      where: { id: taskId, workspaceId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const canDelete = existing.assignedById === userId || workspace.ownerId === userId;
    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.workspaceTask.delete({ where: { id: taskId } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("WORKSPACE TASK DELETE ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
