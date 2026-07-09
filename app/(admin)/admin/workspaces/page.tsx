"use client";

import { useEffect, useState } from "react";

export default function AdminWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/workspaces", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const json = await res.json();
      setWorkspaces(json.workspaces || []);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <div className="p-6">Loading workspaces…</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Workspaces</h1>

      <div className="space-y-4">
        {workspaces.map((ws) => (
          <div key={ws.id} className="border rounded p-4">
            <h2 className="font-semibold">{ws.name}</h2>
            <p className="text-sm text-gray-600">Owner: {ws.ownerName}</p>
            <p className="text-sm text-gray-600">Members: {ws.memberCount}</p>
            <p className="text-sm text-gray-600">Tier: {ws.tier}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
