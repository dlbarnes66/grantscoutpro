"use client";

import { ReactNode } from "react";
import { useWorkspaceACL } from "@/lib/security/useWorkspaceACL";

interface WorkspaceACLHideProps {
  workspaceId: string;
  requireAdmin?: boolean;
  requireOwner?: boolean;
  children: ReactNode;
}

export default function WorkspaceACLHide({
  workspaceId,
  requireAdmin = false,
  requireOwner = false,
  children,
}: WorkspaceACLHideProps) {
  const acl = useWorkspaceACL(workspaceId);

  if (acl.loading) return null;

  if (requireOwner && !acl.canManageWorkspace) return null;

  if (requireAdmin && !acl.canManageMembers) return null;

  return <>{children}</>;
}
