"use client";

import { useEffect, useState } from "react";

export function useWorkspaceACL(workspaceId: string) {
  const [acl, setACL] = useState({
    role: "member",
    canManageMembers: false,
    canManageWorkspace: false,
    loading: true,
  });

  useEffect(() => {
    async function loadACL() {
      const res = await fetch(`/api/workspaces/${workspaceId}/acl/self`);
      const data = await res.json();

      setACL({
        role: data.role,
        canManageMembers: data.role === "ADMIN" || data.role === "OWNER",
        canManageWorkspace: data.role === "OWNER",
        loading: false,
      });
    }

    loadACL();
  }, [workspaceId]);

  return acl;
}
