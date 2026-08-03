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
      const res = await fetch(
        `/api/workspaces/${workspaceId}/grants/${grantId}/acl/self`
      );

      const data = await res.json();

      setACL({
        canView: data.canView,
        canEdit: data.canEdit,
        canRunDocumentAI: data.canRunDocumentAI,
        loading: false,
      });
    }

    loadACL();
  }, [workspaceId, grantId]);

  return acl;
}
