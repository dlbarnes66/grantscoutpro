"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Trash2, Plus } from "lucide-react";

interface PermissionDef {
  key: string;
  label: string;
  description: string;
}

interface OrgRole {
  id: string;
  name: string;
  permissions: string[];
  memberCount: number;
}

export default function RolesSettingsPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  const [roles, setRoles] = useState<OrgRole[]>([]);
  const [catalog, setCatalog] = useState<PermissionDef[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newPermissions, setNewPermissions] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/organization/roles`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load roles");
      setRoles(json.roles || []);
      setCatalog(json.permissionCatalog || []);
      setCanManage(!!json.canManage);
    } catch (err: any) {
      setError(err?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (workspaceId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  function toggleNewPermission(key: string) {
    setNewPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/organization/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), permissions: Array.from(newPermissions) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to create role");
      setRoles((prev) => [...prev, json.role]);
      setNewName("");
      setNewPermissions(new Set());
      setNotice(`"${json.role.name}" role created.`);
    } catch (err: any) {
      setError(err?.message || "Failed to create role");
    } finally {
      setCreating(false);
    }
  }

  async function togglePermission(role: OrgRole, key: string) {
    const has = role.permissions.includes(key);
    const nextPermissions = has ? role.permissions.filter((p) => p !== key) : [...role.permissions, key];
    setSavingId(role.id);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/organization/roles/${role.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: nextPermissions }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to update role");
      setRoles((prev) => prev.map((r) => (r.id === role.id ? { ...r, permissions: json.role.permissions } : r)));
    } catch (err: any) {
      setError(err?.message || "Failed to update role");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(role: OrgRole) {
    if (!confirm(`Delete the "${role.name}" role? Members holding it will fall back to their base role.`)) return;
    setSavingId(role.id);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/organization/roles/${role.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to delete role");
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
    } catch (err: any) {
      setError(err?.message || "Failed to delete role");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <WorkspaceShell title="Roles & Permissions" workspaceId={workspaceId}>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: `/workspace/${workspaceId}` },
          { label: "Workspace Settings", href: `/workspace/${workspaceId}/settings` },
          { label: "Roles & Permissions" },
        ]}
      />

      <Card className="max-w-3xl p-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold">Roles & Permissions</h1>
          <p className="mt-1 text-sm text-slate-400">
            Custom roles for your organization (e.g. "Grant Writer", "Reviewer"). Assign them to members from the
            Members page. Owners and admins always keep full access - roles are for giving plain members narrower,
            specific access.
          </p>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {notice && <p className="text-[#00E5FF] text-sm">{notice}</p>}

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : !canManage ? (
          <p className="text-amber-400 text-sm">Only workspace owners or admins can manage roles.</p>
        ) : (
          <>
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="rounded-lg border border-white/[0.08] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{role.name}</h3>
                      <p className="text-xs text-slate-500">
                        {role.memberCount} member{role.memberCount === 1 ? "" : "s"} assigned
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(role)}
                      disabled={savingId === role.id}
                      title="Delete role"
                      className="text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {catalog.map((perm) => (
                      <label key={perm.key} className="flex items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={role.permissions.includes(perm.key)}
                          disabled={savingId === role.id}
                          onChange={() => togglePermission(role, perm.key)}
                          className="mt-0.5"
                        />
                        <span>
                          <span className="font-medium">{perm.label}</span>
                          <span className="block text-xs text-slate-500">{perm.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {roles.length === 0 && (
                <p className="text-slate-500 text-sm">No custom roles yet - create one below.</p>
              )}
            </div>

            <form onSubmit={handleCreate} className="rounded-lg border border-white/[0.08] border-dashed p-4 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wide text-slate-500">New role name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Grant Writer"
                  className="w-full p-3 rounded-lg text-black"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {catalog.map((perm) => (
                  <label key={perm.key} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={newPermissions.has(perm.key)}
                      onChange={() => toggleNewPermission(perm.key)}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="font-medium">{perm.label}</span>
                      <span className="block text-xs text-slate-500">{perm.description}</span>
                    </span>
                  </label>
                ))}
              </div>
              <button
                type="submit"
                disabled={creating || !newName.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00E5FF] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-[#06131F] font-medium rounded-lg transition"
              >
                <Plus size={16} /> {creating ? "Creating..." : "Create Role"}
              </button>
            </form>
          </>
        )}
      </Card>
    </WorkspaceShell>
  );
}
