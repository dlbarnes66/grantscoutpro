export function createWorkspace(name: string) {
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  };
}

export function listWorkspaces(workspaces: any[]) {
  return workspaces;
}
