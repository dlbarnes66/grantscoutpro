"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Loader2, Plus, Trash2, Lock } from "lucide-react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import { useWorkspaceTasks, NewWorkspaceTaskInput } from "@/hooks/useWorkspaceTasks";
import { TASK_STATUS_LABELS } from "@/lib/tasks";
import type { EffectiveWorkspaceTaskStatus, WorkspaceTaskStatus } from "@/types/workspace";

interface MemberOption {
  id: string;
  name: string;
}

const STATUS_ORDER: EffectiveWorkspaceTaskStatus[] = ["PAST_DUE", "NEW", "IN_PROGRESS", "COMPLETED"];

const STATUS_STYLES: Record<EffectiveWorkspaceTaskStatus, string> = {
  NEW: "text-slate-300 border-white/[0.12] bg-white/[0.04]",
  IN_PROGRESS: "text-[#00E5FF] border-[#00E5FF]/30 bg-[#00E5FF]/[0.08]",
  COMPLETED: "text-emerald-400 border-emerald-400/30 bg-emerald-400/[0.08]",
  PAST_DUE: "text-red-400 border-red-400/30 bg-red-400/[0.08]",
};

function formatDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function NewTaskForm({
  members,
  saving,
  onAdd,
}: {
  members: MemberOption[];
  saving: boolean;
  onAdd: (input: NewWorkspaceTaskInput) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const canSubmit = title.trim().length > 0 && assigneeId.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const ok = await onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      assigneeId,
      dueDate: dueDate || undefined,
    });
    if (ok) {
      setTitle("");
      setDescription("");
      setAssigneeId("");
      setDueDate("");
      setOpen(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:border-white/[0.2]"
      >
        <Plus size={14} /> New Task
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 space-y-3"
    >
      <div>
        <label className="mb-1 block text-[12px] text-slate-400">Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-md border border-white/[0.1] bg-[#0A1A2F] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
          placeholder="Draft the budget narrative"
        />
      </div>

      <div>
        <label className="mb-1 block text-[12px] text-slate-400">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-white/[0.1] bg-[#0A1A2F] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
          placeholder="Optional details for whoever picks this up"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[12px] text-slate-400">Assign to *</label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            required
            className="w-full rounded-md border border-white/[0.1] bg-[#0A1A2F] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
          >
            <option value="">Select a teammate</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[12px] text-slate-400">Due date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-md border border-white/[0.1] bg-[#0A1A2F] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={!canSubmit || saving}
          className="flex items-center gap-2 rounded-md bg-[#00E5FF] px-4 py-2 text-[13px] font-semibold text-[#06131F] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Assigning..." : "Assign Task"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-4 py-2 text-[13px] text-slate-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function WorkspaceTasksPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;
  const { user } = useUser();

  const {
    tasks,
    loading,
    saving,
    error,
    tasksEnabled,
    addTask,
    updateTask,
    removeTask,
  } = useWorkspaceTasks(workspaceId);

  const [members, setMembers] = useState<MemberOption[]>([]);

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/workspaces/${workspaceId}/members`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = Array.isArray(data?.members) ? data.members : [];
        setMembers(
          list.map((m: any) => ({
            id: m.user?.id ?? m.userId,
            name: m.user?.name || m.user?.email || "Unknown",
          }))
        );
      })
      .catch(() => setMembers([]));
  }, [workspaceId]);

  const grouped = useMemo(() => {
    const groups: Record<EffectiveWorkspaceTaskStatus, typeof tasks> = {
      PAST_DUE: [],
      NEW: [],
      IN_PROGRESS: [],
      COMPLETED: [],
    };
    for (const task of tasks) {
      groups[task.effectiveStatus].push(task);
    }
    return groups;
  }, [tasks]);

  return (
    <WorkspaceShell title="Tasks" workspaceId={workspaceId}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Team Tasks</h1>
        <p className="mt-1 text-[13px] text-slate-400">
          Assign work to teammates. They'll get notified, and past-due items surface
          automatically.
        </p>
      </div>

      {!loading && !tasksEnabled && (
        <div className="flex items-start gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] p-6">
          <Lock size={18} className="mt-0.5 shrink-0 text-slate-500" />
          <div>
            <p className="text-[14px] font-medium text-white">
              Task assignments are a Team, Business, or Enterprise feature
            </p>
            <p className="mt-1 text-[13px] text-slate-400">
              Upgrade your plan to let teammates assign each other tasks with due dates
              and status tracking.
            </p>
            <Link
              href={`/workspace/${workspaceId}/workspace-billing`}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[#00E5FF] px-3.5 py-1.5 text-[13px] font-semibold text-[#06131F] transition-opacity hover:opacity-90"
            >
              View plans
            </Link>
          </div>
        </div>
      )}

      {tasksEnabled && (
        <>
          <div className="mb-6">
            <NewTaskForm members={members} saving={saving} onAdd={addTask} />
            {error && <p className="mt-2 text-[13px] text-red-400">{error}</p>}
          </div>

          {loading && <div className="text-slate-400">Loading tasks…</div>}

          {!loading && tasks.length === 0 && (
            <p className="text-[13px] text-slate-500">
              No tasks yet. Assign the first one above.
            </p>
          )}

          {!loading && tasks.length > 0 && (
            <div className="space-y-6">
              {STATUS_ORDER.filter((s) => grouped[s].length > 0).map((statusKey) => (
                <div key={statusKey}>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    {TASK_STATUS_LABELS[statusKey]} ({grouped[statusKey].length})
                  </p>
                  <div className="space-y-2">
                    {grouped[statusKey].map((task) => {
                      const canDelete = !!user && task.assignedById === user.id;
                      const due = formatDate(task.dueDate);

                      return (
                        <div
                          key={task.id}
                          className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h3 className="truncate text-[14px] font-medium text-white">
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="mt-1 text-[13px] text-slate-400">
                                  {task.description}
                                </p>
                              )}
                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-500">
                                <span>Assigned to: {task.assignedTo.name || task.assignedTo.email}</span>
                                <span>By: {task.assignedBy.name || task.assignedBy.email}</span>
                                {due && <span>Due: {due}</span>}
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <span
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[task.effectiveStatus]}`}
                              >
                                {TASK_STATUS_LABELS[task.effectiveStatus]}
                              </span>

                              <select
                                value={task.status}
                                onChange={(e) =>
                                  updateTask(task.id, { status: e.target.value as WorkspaceTaskStatus })
                                }
                                className="rounded-md border border-white/[0.1] bg-[#0A1A2F] px-2 py-1 text-[12px] text-white outline-none"
                              >
                                <option value="NEW">New</option>
                                <option value="IN_PROGRESS">In Process</option>
                                <option value="COMPLETED">Completed</option>
                              </select>

                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() => removeTask(task.id)}
                                  aria-label="Delete task"
                                  title="Delete task"
                                  className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </WorkspaceShell>
  );
}
