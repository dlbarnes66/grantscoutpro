"use client"

import { useDocumentACL } from "@/lib/security/useDocumentACL";

export default function AiButtonDisabled({
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

  const disabled = !acl.canRunDocumentAI;

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded text-white ${
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {children}
    </button>
  );
}
