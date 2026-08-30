"use client";

import { useEffect, useState } from "react";

export function useDocumentACL(workspaceId: string, documentId: string) {
  const [acl, setACL] = useState({
    canView: false,
    canEdit: false,
    canRunDocumentAI: false,
    loading: true,
  });

  useEffect(() => {
    async function loadACL() {
      try {
        const res = await fetch(
          `/api/workspaces/${workspaceId}/documents/${documentId}/acl/self`
        );

        const data = await res.json();

        setACL({
          canView: data.canView ?? false,
          canEdit: data.canEdit ?? false,
          canRunDocumentAI: data.canRunDocumentAI ?? false,
          loading: false,
        });
      } catch (err) {
        console.error("Document ACL error:", err);
        setACL({
          canView: false,
          canEdit: false,
          canRunDocumentAI: false,
          loading: false,
        });
      }
    }

    loadACL();
  }, [workspaceId, documentId]);

  return acl;
}
