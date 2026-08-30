"use client";

import { useEffect, useState } from "react";

export function useGrantACL(workspaceId: string, grantId: string) {
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
          `/api/workspaces/${workspaceId}/grants/${grantId}/acl/self`
        );

        const data = await res.json();

        setACL({
          canView: data.canView ?? false,
          canEdit: data.canEdit ?? false,
          canRunDocumentAI: data.canRunDocumentAI ?? false,
          loading: false,
        });
      } catch (err) {
        console.error("Grant ACL error:", err);
        setACL({
          canView: false,
          canEdit: false,
          canRunDocumentAI: false,
          loading: false,
        });
      }
    }

    loadACL();
  }, [workspaceId, grantId]);

  return acl;
}
