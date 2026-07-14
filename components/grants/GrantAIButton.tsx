"use client";

import { useGrantACL } from "@/lib/security/useGrantACL";

export default function GrantAIButton({
  workspaceId,
  grantId,
  onClick,
  children,
}) {
  const acl = useGrantACL(workspaceId, grantId);

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

  if (!acl.canRunAI) {
    return null; // auto-hide
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
