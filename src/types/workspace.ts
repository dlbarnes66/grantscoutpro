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
