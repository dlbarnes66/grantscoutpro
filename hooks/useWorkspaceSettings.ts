"use client";

import { useEffect, useState } from "react";

interface Member {
  id: string;
  email: string;
  role: string;
}

interface Workspace {
  id: string;
  name: string;
  trialEndsAt: string | null;
  members: Member[];
}

export function useWorkspaceSettings() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/workspace/settings");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load workspace settings");
        setLoading(false);
        return;
      }

      setWorkspace(data.workspace);
      setLoading(false);
    } catch (err) {
      console.error("Workspace settings hook error:", err);
      setError("Unexpected error");
      setLoading(false);
    }
  }

  async function updateName(name: string) {
    const res = await fetch("/api/workspace/settings/name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (res.ok) {
      setWorkspace(data.workspace);
    }

    return data;
  }

  async function invite(email: string, role: string) {
    const res = await fetch("/api/workspace/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    const data = await res.json();

    if (res.ok && workspace) {
      setWorkspace({
        ...workspace,
        members: [...workspace.members, data.member],
      });
    }

    return data;
  }

  useEffect(() => {
    load();
  }, []);

  return { workspace, loading, error, updateName, invite };
}
