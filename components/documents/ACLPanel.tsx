"use client";

import { useEffect, useState } from "react";

export default function ACLPanel({ workspaceId, documentId }) {
  const [acl, setAcl] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadACL();
    loadWorkspaceUsers();
  }, []);

  async function loadACL() {
    const res = await fetch(
      `/api/workspaces/${workspaceId}/documents/${documentId}/acl`
    );
    const data = await res.json();
    setAcl(data);
    setLoading(false);
  }

  async function loadWorkspaceUsers() {
    const res = await fetch(`/api/workspaces/${workspaceId}/members`);
    const data = await res.json();
    setUsers(data);
  }

  async function updateACL(userId, field, value) {
    await fetch(
      `/api/workspaces/${workspaceId}/documents/${documentId}/acl`,
      {
        method: "POST",
        body: JSON.stringify({
          targetUserId: userId,
          canView: field === "canView" ? value : acl.find(a => a.userId === userId)?.canView,
          canEdit: field === "canEdit" ? value : acl.find(a => a.userId === userId)?.canEdit,
          canRunDocumentAI: field === "canRunDocumentAI" ? value : acl.find(a => a.userId === userId)?.canRunDocumentAI,
        }),
      }
    );

    loadACL();
  }

  async function removeACL(userId) {
    await fetch(
      `/api/workspaces/${workspaceId}/documents/${documentId}/acl`,
      {
        method: "DELETE",
        body: JSON.stringify({ targetUserId: userId }),
      }
    );

    loadACL();
  }

  if (loading) return <div>Loading ACL...</div>;

  return (
    <div className="p-4 border rounded bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Document Access Control</h2>

      {acl.map(entry => (
        <div key={entry.userId} className="border p-3 mb-3 rounded">
          <div className="font-semibold">{entry.user.name || entry.user.email}</div>

          <div className="flex gap-4 mt-2">
            <label>
              <input
                type="checkbox"
                checked={entry.canView}
                onChange={e => updateACL(entry.userId, "canView", e.target.checked)}
              />
              View
            </label>

            <label>
              <input
                type="checkbox"
                checked={entry.canEdit}
                onChange={e => updateACL(entry.userId, "canEdit", e.target.checked)}
              />
              Edit
            </label>

            <label>
              <input
                type="checkbox"
                checked={entry.canRunDocumentAI}
                onChange={e => updateACL(entry.userId, "canRunDocumentAI", e.target.checked)}
              />
              Run AI
            </label>

            <button
              className="text-red-600 ml-auto"
              onClick={() => removeACL(entry.userId)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <h3 className="text-lg font-bold mt-6">Add User</h3>
      <div className="mt-2">
        {users
          .filter(u => !acl.some(a => a.userId === u.userId))
          .map(u => (
            <button
              key={u.userId}
              className="block w-full text-left p-2 border rounded mb-2"
              onClick={() =>
                updateACL(u.userId, "canView", true)
              }
            >
              {u.user.name || u.user.email}
            </button>
          ))}
      </div>
    </div>
  );
}
