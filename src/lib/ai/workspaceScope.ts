// src/lib/ai/workspaceScope.ts
//
// Lets callUnifiedModel find out which workspace it is working for without
// each of the ~100 AI routes passing the id through by hand.
//
// src/proxy.ts has already checked that the signed-in user holds an active
// seat in the workspace named in /api/workspaces/[id]/..., and it forwards
// that id in WORKSPACE_SCOPE_HEADER. The proxy also strips the header from
// every incoming request first, so a client cannot set it to charge AI
// usage to somebody else's workspace.

import { headers } from "next/headers";
import { WORKSPACE_SCOPE_HEADER } from "@/lib/ai/workspaceHeader";

/** The workspace the current request was verified for, or undefined (cron jobs, scripts, non-workspace routes). */
export async function getScopedWorkspaceId(): Promise<string | undefined> {
  try {
    const value = (await headers()).get(WORKSPACE_SCOPE_HEADER);
    return value && value.trim() ? value.trim() : undefined;
  } catch {
    // headers() throws outside a request scope.
    return undefined;
  }
}
