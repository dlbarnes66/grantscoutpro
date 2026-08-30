"use client"

import { useDocumentACL } from "@/lib/security/useDocumentACL";

export default function PanelACLHide({
  workspaceId,
  documentId,
  children,
  requireAI = false,
  requireEdit = false,
  requireView = true,
}) {
  const acl = useDocumentACL(workspaceId, documentId);

  if (acl.loading) {
    return null; // hide until ACL loads
  }

  // Hide panel if user cannot view
  if (requireView && !acl.canView) {
    return null;
  }

  // Hide panel if user cannot run AI
  if (requireAI && !acl.canRunDocumentAI) {
    return null;
  }

  // Hide panel if user cannot edit
  if (requireEdit && !acl.canEdit) {
    return null;
  }

  return children;
}
