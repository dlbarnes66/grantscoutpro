"use client";

import { useEffect, useState } from "react";

export function usePresence(workspaceId: string, documentId: string) {
  const [presence, setPresence] = useState<any[]>([]);

  // Poll presence list
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/presence/list`
      );
      const data = await res.json();
      setPresence(data.presence || []);
    }, 2000);

    return () => clearInterval(interval);
  }, [workspaceId, documentId]);

  // Update presence
  async function updatePresence(status: string = "online") {
    await fetch(
      `/api/workspaces/${workspaceId}/documents/${documentId}/presence/update`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );
  }

  // Leave presence
  async function leavePresence() {
    await fetch(
      `/api/workspaces/${workspaceId}/documents/${documentId}/presence/leave`,
      {
        method: "POST",
      }
    );
  }

  return { presence, updatePresence, leavePresence };
}
