import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plans";
import { getEffectiveTaskStatus } from "@/lib/tasks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

const TASK_INCLUDE = {
  assignedTo: { select: { id: true, name: true, email: true } },
  assignedBy: { select: { id: true, name: true, email: true } },
} as const;

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

// GET - list every task in the workspace (visible to any active member,
// not just the assignee, so a manager can see the whole team's board).
export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const workspace = await loadWorkspaceForMember(id, userId);
    if (!workspace) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const plan = getEffectivePlan(workspace);
    const tasksEnabled = plan.access.tasks;

    const tasks = tasksEnabled
      ? await prisma.workspaceTask.findMany({
          where: { workspaceId: id },
          orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
          include: TASK_INCLUDE,
        })
      : [];

    return NextResponse.json({
      success: true,
      tasksEnabled,
      planName: plan.name,
      tasks: tasks.map((t) => ({
        ...t,
        effectiveStatus: getEffectiveTaskStatus(t.status, t.dueDate),
      })),
    });
  } catch (err: any) {
    console.error("WORKSPACE TASKS GET ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

// POST - create a task and notify the assignee.
export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const workspace = await loadWorkspaceForMember(id, userId);
    if (!workspace) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const plan = getEffectivePlan(workspace);
    if (!plan.access.tasks) {
      return NextResponse.json(
        {
          error:
            "Task assignments are available on the Team, Business, and Enterprise plans. Upgrade to start assigning tasks.",
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const assigneeId = typeof body?.assigneeId === "string" ? body.assigneeId : "";

    if (!title || !assigneeId) {
      return NextResponse.json({ error: "Missing title or assigneeId" }, { status: 400 });
    }

    const assigneeIsMember =
      workspace.ownerId === assigneeId ||
      workspace.members.some((m) => m.userId === assigneeId);
    if (!assigneeIsMember) {
      return NextResponse.json(
        { error: "Assignee must be a member of this workspace." },
        { status: 400 }
      );
    }

    let dueDate: Date | null = null;
    if (body?.dueDate) {
      const parsed = new Date(body.dueDate);
      if (!Number.isNaN(parsed.getTime())) dueDate = parsed;
    }

    const task = await prisma.workspaceTask.create({
      data: {
        workspaceId: id,
        title,
        description: typeof body?.description === "string" ? body.description.trim() || null : null,
        dueDate,
        assignedToId: assigneeId,
        assignedById: userId,
      },
      include: TASK_INCLUDE,
    });

    // Notify the assignee - unless they assigned it to themselves.
    if (task.assignedToId !== userId) {
      const assignerName = task.assignedBy.name || task.assignedBy.email || "A teammate";
      const dueSuffix = task.dueDate
        ? ` (due ${task.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})`
        : "";

      await prisma.workspaceNotification.create({
        data: {
          workspaceId: id,
          userId: task.assignedToId,
          type: "task_assigned",
          message: `${assignerName} assigned you a task: "${task.title}"${dueSuffix}`,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        task: { ...task, effectiveStatus: getEffectiveTaskStatus(task.status, task.dueDate) },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("WORKSPACE TASKS POST ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
