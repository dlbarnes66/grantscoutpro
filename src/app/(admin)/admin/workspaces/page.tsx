"use client"

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useEffect, useState } from "react";

export default function AdminWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/workspaces");
        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }
        const json = await res.json();
        setWorkspaces(json);
      } catch (err) {
        console.error("Failed to load workspaces:", err);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Workspaces</h1>
      <pre className="mt-4">{JSON.stringify(workspaces, null, 2)}</pre>
    </div>
  );
}
