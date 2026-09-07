"use client";

import { useEffect, useState } from "react";

type Member = {
  id: string;
  userId: string;
  email: string | null;
  name: string | null;
  role: string;
  status: string;
  createdAt: string;
  isOwner: boolean;
};

const ASSIGNABLE_ROLES = ["member", "admin"] as const;

export default function MembersSection({ workspaceId }: { workspaceId: string }) {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [viewerRole, setViewerRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<(typeof ASSIGNABLE_ROLES)[number]>("member");
  const [adding, setAdding] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/admin/members`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load members");
      setMembers(json.members);
      setViewerRole(json.viewerRole);
    } catch (err: any) {
      setError(err.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const isOwnerViewer = viewerRole === "owner";

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/admin/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", email: newEmail.trim(), role: newRole }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add member");
      setNewEmail("");
      setNewRole("member");
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    setBusyUserId(userId);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/admin/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update role");
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    setBusyUserId(userId);
    setError(null);
    try {
      const action = currentStatus === "active" ? "deactivate" : "activate";
      const res = await fetch(`/api/workspaces/${workspaceId}/admin/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update status");
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Remove this member from the workspace?")) return;
    setBusyUserId(userId);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/admin/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to remove member");
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to remove member");
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm space-y-4">
      <h2 className="text-xl font-bold">Members</h2>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}

      {loading && <p className="text-gray-600 text-sm">Loading members...</p>}

      {!loading && members && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Status</th>
                {isOwnerViewer && <th className="py-2 pr-4">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{m.name || "—"}</td>
                  <td className="py-2 pr-4">{m.email}</td>
                  <td className="py-2 pr-4">
                    {isOwnerViewer && !m.isOwner ? (
                      <select
                        value={m.role}
                        disabled={busyUserId === m.userId}
                        onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        {ASSIGNABLE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="capitalize">{m.role}</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 capitalize">{m.status}</td>
                  {isOwnerViewer && (
                    <td className="py-2 pr-4 space-x-2">
                      {!m.isOwner && (
                        <>
                          <button
                            type="button"
                            disabled={busyUserId === m.userId}
                            onClick={() => handleStatusToggle(m.userId, m.status)}
                            className="text-blue-700 hover:underline disabled:opacity-50"
                          >
                            {m.status === "active" ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            disabled={busyUserId === m.userId}
                            onClick={() => handleRemove(m.userId)}
                            className="text-red-700 hover:underline disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isOwnerViewer && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 pt-4 border-t">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Email address</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="teammate@example.com"
              className="border rounded px-3 py-2 text-sm w-64"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as typeof newRole)}
              className="border rounded px-3 py-2 text-sm"
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={adding}
            className="bg-black text-white rounded px-4 py-2 text-sm disabled:opacity-50"
          >
            {adding ? "Adding..." : "Add user"}
          </button>
          <p className="text-xs text-gray-500 w-full">
            The person must already have a Grant Scout Pro account under this email — there's no
            invite-email step yet, so have them sign up first if they don't.
          </p>
        </form>
      )}
    </div>
  );
}
