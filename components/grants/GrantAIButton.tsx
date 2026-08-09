"use client";

import { useGrantACL } from "@/lib/security/useGrantACL";
import { GrantACL } from "./types";

export default function GrantAIButton({
  workspaceId,
  grantId,
  onClickAction,
  children
}: {
  workspaceId: string;
  grantId: string;
  onClickAction: () => void;
  children: React.ReactNode;
}) {
  const acl: GrantACL = useGrantACL(workspaceId, grantId);

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

  if (!acl.canRunDocumentAI) return null;

  return (
    <button
      onClick={onClickAction}
      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
    >
      {children}
    </button>
  );
}