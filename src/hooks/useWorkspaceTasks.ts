"use client";

import { useCallback, useEffect, useState } from "react";
import { WorkspaceTask } from "@/types/workspace";

export interface NewWorkspaceTaskInput {
  title: string;
  description?: string;
  assigneeId: string;
  dueDate?: string;
}

export interface UpdateWorkspaceTaskInput {
  status?: "NEW" | "IN_PROGRESS" | "COMPLETED";
  title?: string;
  description?: string | null;
  assigneeId?: string;
  dueDate?: string | null;
}

interface UseWorkspaceTasksResult {
  tasks: WorkspaceTask[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  tasksEnabled: boolean;
  planName: string | null;
  refresh: () => Promise<void>;
  addTask: (input: NewWorkspaceTaskInput) => Promise<boolean>;
  updateTask: (taskId: string, input: UpdateWorkspaceTaskInput) => Promise<boolean>;
  removeTask: (taskId: string) => Promise<boolean>;
}

export function useWorkspaceTasks(workspaceId: string): UseWorkspaceTasksResult {
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasksEnabled, setTasksEnabled] = useState(false);
  const [planName, setPlanName] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks`);
      if (!res.ok) {
        setTasks([]);
        setTasksEnabled(false);
        return;
      }
      const data = await res.json();
      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
      setTasksEnabled(!!data.tasksEnabled);
      setPlanName(data.planName ?? null);
    } catch {
      setTasks([]);
      setTasksEnabled(false);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) fetchTasks();
  }, [workspaceId, fetchTasks]);

  const addTask = useCallback(
    async (input: NewWorkspaceTaskInput) => {
      setSaving(true);
      setError(null);
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error || "Failed to create task.");
          return false;
        }
        await fetchTasks();
        return true;
      } catch {
        setError("Failed to create task.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [workspaceId, fetchTasks]
  );

  const updateTask = useCallback(
    async (taskId: string, input: UpdateWorkspaceTaskInput) => {
      setError(null);
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error || "Failed to update task.");
          return false;
        }
        const data = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
        return true;
      } catch {
        setError("Failed to update task.");
        return false;
      }
    },
    [workspaceId]
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      setError(null);
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/tasks/${taskId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error || "Failed to remove task.");
          return false;
        }
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        return true;
      } catch {
        setError("Failed to remove task.");
        return false;
      }
    },
    [workspaceId]
  );

  return {
    tasks,
    loading,
    saving,
    error,
    tasksEnabled,
    planName,
    refresh: fetchTasks,
    addTask,
    updateTask,
    removeTask,
  };
}
