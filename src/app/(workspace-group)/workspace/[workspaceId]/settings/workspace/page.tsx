"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function WorkspaceDetailsSettingsPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;
  const router = useRouter();
  const { user } = useUser();

  const [name, setName] = useState("");
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId || !user) return;
    (async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load workspace");

        const workspace = json.workspace;
        setName(workspace.name);

        const isOwner = workspace.ownerId === user.id;
        const membership = workspace.members?.find((m: any) => m.userId === user.id);
        setCanManage(isOwner || membership?.role === "admin");
      } catch (err: any) {
        setError(err?.message || "Failed to load workspace");
      } finally {
        setLoading(false);
      }
    })();
  }, [workspaceId, user]);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to save");
      setName(json.workspace.name);
      setMessage("Workspace updated.");
    } catch (err: any) {
      setError(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function deleteWorkspace() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to delete workspace");
      router.push("/home");
    } catch (err: any) {
      setDeleteError(err?.message || "Failed to delete workspace");
      setDeleting(false);
    }
  }

  return (
    <WorkspaceShell title="Workspace Details" workspaceId={workspaceId}>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: `/workspace/${workspaceId}` },
          { label: "Workspace Settings", href: `/workspace/${workspaceId}/settings` },
          { label: "Workspace Details" },
        ]}
      />

      <div className="max-w-xl space-y-6">
        <Card className="p-6 space-y-4">
          <div>
            <h1 className="text-xl font-bold">Workspace Details</h1>
            <p className="mt-1 text-sm text-slate-400">
              Rename this workspace. This is what shows up in the sidebar
              and workspace switcher for everyone on it.
            </p>
          </div>

          {loading && <p className="text-slate-400 text-sm">Loading...</p>}

          {!loading && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wide text-slate-500">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!canManage}
                  className="w-full p-3 rounded-lg text-black disabled:opacity-60"
                />
              </div>

              {!canManage && (
                <p className="text-amber-400 text-sm">
                  Only workspace owners or admins can edit this workspace.
                </p>
              )}

              {canManage && (
                <button
                  onClick={save}
                  disabled={saving || !name.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00E5FF] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-[#06131F] font-medium rounded-lg transition"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              )}

              {message && <p className="text-[#00E5FF] text-sm">{message}</p>}
              {error && <p className="text-red-400 text-sm">{error}</p>}
            </>
          )}
        </Card>

        {!loading && canManage && (
          <Card className="p-6 space-y-4 border-red-500/30">
            <div>
              <h2 className="text-lg font-bold text-red-400">Danger Zone</h2>
              <p className="mt-1 text-sm text-slate-400">
                Deleting a workspace removes it from the workspace list for
                everyone on it. Grants, documents, and other data aren&apos;t
                permanently erased immediately, but the workspace itself
                becomes inaccessible right away. This can&apos;t be undone
                from the app - contact support if you need it restored.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wide text-slate-500">
                Type <span className="font-semibold text-slate-300">{name}</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full p-3 rounded-lg text-black"
              />
            </div>

            <button
              onClick={deleteWorkspace}
              disabled={deleting || confirmText !== name}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
            >
              {deleting ? "Deleting..." : "Delete Workspace"}
            </button>

            {deleteError && <p className="text-red-400 text-sm">{deleteError}</p>}
          </Card>
        )}
      </div>
    </WorkspaceShell>
  );
}
