"use client";

import { useEffect, useState } from "react";

export default function usePresence(workspaceId, documentId, userId) {
  const [presence, setPresence] = useState([]);

  async function updatePresence() {
    try {
      await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/presence`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        }
      );
    } catch (err) {
      console.error("Failed to update presence:", err);
    }
  }

  async function fetchPresence() {
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/presence`
      );
      const data = await res.json();
      setPresence(data.presence || []);
    } catch (err) {
      console.error("Failed to fetch presence:", err);
    }
  }

  useEffect(() => {
    updatePresence();
    fetchPresence();

    const interval = setInterval(() => {
      updatePresence();
      fetchPresence();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return presence;
}
