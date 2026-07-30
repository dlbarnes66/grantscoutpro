"use client";

import { useEffect, useState } from "react";
import { WorkspaceMember } from "./admin/types";

export default function AdminDashboard({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/workspaces/${workspaceId}/admin/members`);
      const data = await res.json();
      setMembers(data);
    }
    load();
  }, [workspaceId]);

  async function updateRole(userId: string, newRole: WorkspaceMember["role"]) {
    await fetch(`/api/workspaces/${workspaceId}/admin/members`, {
      method: "POST",
      body: JSON.stringify({ targetUserId: userId, newRole }),
    });

    location.reload();
  }

  return (
    <div className="p-6 border rounded bg-white shadow space-y-6">
      <h2 className="text-2xl font-bold">Workspace Admin Dashboard</h2>

      <div className="space-y-4">
        {members.map((m) => (
          <div key={m.userId} className="p-4 border rounded bg-gray-50">
            <div className="font-semibold">{m.user.email}</div>
            <div className="text-sm text-gray-600">Role: {m.role}</div>

            <div className="mt-3 space-x-2">
              <button
                onClick={() => updateRole(m.userId, "MEMBER")}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Member
              </button>

              <button
                onClick={() => updateRole(m.userId, "ADMIN")}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Admin
              </button>

              <button
                onClick={() => updateRole(m.userId, "OWNER")}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Owner
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
