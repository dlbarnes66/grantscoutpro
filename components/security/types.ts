export interface WorkspaceACL {
  role: "MEMBER" | "ADMIN" | "OWNER";
  canManageMembers: boolean;
  canManageWorkspace: boolean;
  loading: boolean;
}
