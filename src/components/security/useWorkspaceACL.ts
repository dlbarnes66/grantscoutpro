"use client"

import { useEffect, useState } from "react";
import { WorkspaceACL } from "./types";

export default function useWorkspaceACL(workspaceId: string): WorkspaceACL {
  const [acl, setACL] = useState<WorkspaceACL>({
    role: "MEMBER",
    canManageMembers: false,
    canManageWorkspace: false,
    loading: true,
  });

  useEffect(() => {
    async function loadACL() {
      const res = await fetch(`/api/workspaces/${workspaceId}/acl/self`);
      const data = await res.json();

      const role = data.role as WorkspaceACL["role"];

      setACL({
        role,
        canManageMembers: role === "ADMIN" || role === "OWNER",
        canManageWorkspace: role === "OWNER",
        loading: false,
      });
    }

    loadACL();
  }, [workspaceId]);

  return acl;
}
