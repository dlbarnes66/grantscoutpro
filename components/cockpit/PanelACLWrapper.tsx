"use client";

import { useDocumentACL } from "@/lib/security/useDocumentACL";

export default function PanelACLWrapper({
  workspaceId,
  documentId,
  children,
  requireAI = false,
  requireEdit = false,
  requireView = true,
}) {
  const acl = useDocumentACL(workspaceId, documentId);

  if (acl.loading) {
    return <div className="p-4">Loading permissions...</div>;
  }

  // Block view entirely
  if (requireView && !acl.canView) {
    return (
      <div className="p-4 text-red-600">
        You do not have permission to view this panel.
      </div>
    );
  }

  // Block AI panels
  if (requireAI && !acl.canRunAI) {
    return (
      <div className="p-4 text-red-600">
        You do not have permission to run AI on this document.
      </div>
    );
  }

  // Block editing
  if (requireEdit && !acl.canEdit) {
    return (
      <div className="p-4 text-yellow-600">
        You can view this panel but cannot edit it.
      </div>
    );
  }

  return children;
}
