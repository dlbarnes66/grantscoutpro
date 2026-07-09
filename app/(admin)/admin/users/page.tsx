"use client";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const json = await res.json();
      setUsers(json.users || []);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <div className="p-6">Loading users…</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Users</h1>

      <div className="space-y-4">
        {users.map((u) => (
          <div key={u.id} className="border rounded p-4">
            <h2 className="font-semibold">{u.name}</h2>
            <p className="text-sm text-gray-600">{u.email}</p>
            <p className="text-sm text-gray-600">Tier: {u.tier}</p>
            <p className="text-sm text-gray-600">Workspace: {u.workspaceId}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
