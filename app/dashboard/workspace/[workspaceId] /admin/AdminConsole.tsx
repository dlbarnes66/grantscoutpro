"use client";

import { useEffect, useState } from "react";

export default function AdminConsole({
  workspaceId
}: {
  workspaceId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const response = await fetch(
        "/api/workspace/" + workspaceId + "/admin"
      );
      const json = await response.json();
      setUsers(json.users || []);
      setLoading(false);
    }
    load();
  }, [workspaceId]);

  async function updateRole(userId: string, role: string) {
    setSaving(true);

    const response = await fetch(
      "/api/workspace/" + workspaceId + "/admin",
      {
        method: "POST",
        body: JSON.stringify({ userId: userId, role: role })
      }
    );

    const json = await response.json();

    if (json.updated) {
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === userId ? { ...u, role: role } : u
        )
      );
    }

    setSaving(false);
  }

  if (loading) {
    return <p>Loading admin console...</p>;
  }

  return (
    <div className="space-y-6 p-4 border rounded-md bg-white shadow-sm">
      <h2 className="text-xl font-semibold">Workspace Users</h2>

      <div className="space-y-4">
        {users.map((u) => (
          <div
            key={u.userId}
            className="p-4 border rounded-md bg-gray-50 space-y-2"
          >
            <p className="font-semibold">{u.user.email}</p>

            <select
              className="p-2 border rounded-md"
              value={u.role}
              onChange={(e) =>
                updateRole(u.userId, e.target.value)
              }
            >
              <option value="Owner">Owner</option>
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
        ))}
      </div>

      {saving && (
        <p className="text-blue-600 font-semibold">
          Saving changes...
        </p>
      )}
    </div>
  );
}
