"use client";

import { useDocumentACL } from "@/lib/security/useDocumentACL";

export default function AiButton({
  workspaceId,
  documentId,
  onClick,
  children,
}) {
  const acl = useDocumentACL(workspaceId, documentId);

  if (acl.loading) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded bg-gray-300 text-gray-600 cursor-not-allowed"
      >
        Loading…
      </button>
    );
  }

  // Hide button entirely if user cannot run AI
  if (!acl.canRunAI) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
    >
      {children}
    </button>
  );
}
