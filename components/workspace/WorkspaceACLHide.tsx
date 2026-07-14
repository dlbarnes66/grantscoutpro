"use client";

import { useWorkspaceACL } from "@/lib/security/useWorkspaceACL";

export default function WorkspaceACLHide({
  workspaceId,
  requireAdmin = false,
  requireOwner = false,
  children,
}) {
  const acl = useWorkspaceACL(workspaceId);

  if (acl.loading) return null;

  if (requireOwner && !acl.canManageWorkspace) return null;

  if (requireAdmin && !acl.canManageMembers) return null;

  return children;
}
