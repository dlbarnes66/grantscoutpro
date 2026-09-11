// src/types/workspace.ts

export interface WorkspaceLocation {
  id: string;

  name?: string;
  address?: string;

  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  country?: string;
  timezone?: string;
}

export type WorkspaceTaskStatus = "NEW" | "IN_PROGRESS" | "COMPLETED";
export type EffectiveWorkspaceTaskStatus = WorkspaceTaskStatus | "PAST_DUE";

export interface WorkspaceTaskMember {
  id: string;
  name?: string | null;
  email?: string | null;
}

export interface WorkspaceTask {
  id: string;
  workspaceId: string;
  title: string;
  description?: string | null;
  status: WorkspaceTaskStatus;
  effectiveStatus: EffectiveWorkspaceTaskStatus;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  assignedToId: string;
  assignedById: string;
  assignedTo: WorkspaceTaskMember;
  assignedBy: WorkspaceTaskMember;
}
