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
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/acl/self`);
        const data = await res.json();

        const role = (data.role ?? "member").toUpperCase();

        setACL({
          role,
          canManageMembers: role === "ADMIN" || role === "OWNER",
          canManageWorkspace: role === "OWNER",
          loading: false,
        });
      } catch (err) {
        console.error("Workspace ACL error:", err);
        setACL({
          role: "member",
          canManageMembers: false,
          canManageWorkspace: false,
          loading: false,
        });
      }
    }

    loadACL();
  }, [workspaceId]);

  return acl;
}
