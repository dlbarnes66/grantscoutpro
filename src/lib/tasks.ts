import type { WorkspaceTaskStatus } from "@prisma/client";

export type EffectiveTaskStatus = WorkspaceTaskStatus | "PAST_DUE";

// "Past due" isn't a status anyone sets - it's what a NEW or IN_PROGRESS
// task becomes once its due date has passed. Kept as a pure function
// instead of a stored enum value so a task finished late correctly shows
// "Completed", not a "Past Due" it can never leave.
export function getEffectiveTaskStatus(
  status: WorkspaceTaskStatus,
  dueDate: Date | string | null
): EffectiveTaskStatus {
  if (status === "COMPLETED" || !dueDate) return status;
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  if (due.getTime() < Date.now()) return "PAST_DUE";
  return status;
}

export const TASK_STATUS_LABELS: Record<EffectiveTaskStatus, string> = {
  NEW: "New",
  IN_PROGRESS: "In Process",
  COMPLETED: "Completed",
  PAST_DUE: "Past Due",
};
