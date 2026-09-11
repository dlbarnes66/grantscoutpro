"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useEffect, useState } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  subscriptionTier: string;
  billingStatus: string;
  maxSeats: number;
  currentSeats: number;
  suspended: boolean;
  createdAt: string;
}

interface EditState {
  name: string;
  subscriptionTier: string;
  billingStatus: string;
  maxSeats: string;
  suspended: boolean;
}

export default function AdminWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/workspaces");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
      setWorkspaces(Array.isArray(json.workspaces) ? json.workspaces : []);
    } catch (err: any) {
      console.error("Failed to load workspaces:", err);
      setError(err?.message || "Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(ws: Workspace) {
    setEditingId(ws.id);
    setEdit({
      name: ws.name,
      subscriptionTier: ws.subscriptionTier,
      billingStatus: ws.billingStatus,
      maxSeats: String(ws.maxSeats),
      suspended: ws.suspended,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEdit(null);
  }

  async function saveEdit(workspaceId: string) {
    if (!edit) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/workspace/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          name: edit.name,
          subscriptionTier: edit.subscriptionTier,
          billingStatus: edit.billingStatus,
          maxSeats: edit.maxSeats,
          suspended: edit.suspended,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save changes");
      setWorkspaces((prev) => prev.map((w) => (w.id === workspaceId ? { ...w, ...data.workspace } : w)));
      cancelEdit();
    } catch (err: any) {
      setError(err?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[13px] text-white outline-none focus:border-[#00E5FF]/50";

  return (
    <div className="min-h-screen bg-[#0A1A2F] p-6 text-white">
      <h1 className="text-2xl font-bold">Admin Workspaces</h1>
      <p className="mt-1 text-[13px] text-slate-400">
        Edit a workspace's name, plan, billing status, seat limit, or suspension directly. Changes save immediately -
        there's no confirmation step beyond the Save button itself.
      </p>

      {error && <p className="mt-4 text-[13px] text-red-400">{error}</p>}

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-slate-400">
          <Loader2 size={16} className="animate-spin" /> Loading...
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-white/[0.08]">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.03] text-slate-400">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Slug</th>
                <th className="px-3 py-2 font-medium">Tier</th>
                <th className="px-3 py-2 font-medium">Billing Status</th>
                <th className="px-3 py-2 font-medium">Seats (used/max)</th>
                <th className="px-3 py-2 font-medium">Suspended</th>
                <th className="px-3 py-2 font-medium">Created</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {workspaces.map((ws) => {
                const isEditing = editingId === ws.id;
                return (
                  <tr key={ws.id} className="border-b border-white/[0.05] last:border-0">
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input
                          className={inputClass}
                          value={edit?.name || ""}
                          onChange={(e) => setEdit((p) => (p ? { ...p, name: e.target.value } : p))}
                        />
                      ) : (
                        ws.name
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-400">{ws.slug}</td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input
                          className={inputClass}
                          value={edit?.subscriptionTier || ""}
                          onChange={(e) =>
                            setEdit((p) => (p ? { ...p, subscriptionTier: e.target.value } : p))
                          }
                        />
                      ) : (
                        ws.subscriptionTier
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input
                          className={inputClass}
                          value={edit?.billingStatus || ""}
                          onChange={(e) => setEdit((p) => (p ? { ...p, billingStatus: e.target.value } : p))}
                        />
                      ) : (
                        ws.billingStatus
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input
                          type="number"
                          min={1}
                          className={inputClass}
                          value={edit?.maxSeats || ""}
                          onChange={(e) => setEdit((p) => (p ? { ...p, maxSeats: e.target.value } : p))}
                        />
                      ) : (
                        `${ws.currentSeats}/${ws.maxSeats}`
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={edit?.suspended || false}
                          onChange={(e) => setEdit((p) => (p ? { ...p, suspended: e.target.checked } : p))}
                        />
                      ) : ws.suspended ? (
                        <span className="text-red-400">Yes</span>
                      ) : (
                        <span className="text-slate-500">No</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-400">
                      {new Date(ws.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveEdit(ws.id)}
                            disabled={saving}
                            title="Save"
                            className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                          >
                            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                          </button>
                          <button onClick={cancelEdit} disabled={saving} title="Cancel" className="text-slate-400 hover:text-white">
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(ws)}
                          title="Edit"
                          className="text-slate-400 hover:text-white"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {workspaces.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No workspaces found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
