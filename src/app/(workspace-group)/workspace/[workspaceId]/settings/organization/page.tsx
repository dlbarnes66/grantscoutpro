"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function OrganizationSettingsPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  const [name, setName] = useState("");
  const [tier, setTier] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) return;
    (async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/organization`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load organization");
        setName(json.organization.name);
        setTier(json.organization.tier);
        setCanEdit(json.canEdit);
      } catch (err: any) {
        setError(err?.message || "Failed to load organization");
      } finally {
        setLoading(false);
      }
    })();
  }, [workspaceId]);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/organization`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to save");
      setName(json.organization.name);
      setMessage("Organization profile updated.");
    } catch (err: any) {
      setError(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <WorkspaceShell title="Organization Profile" workspaceId={workspaceId}>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: `/workspace/${workspaceId}` },
          { label: "Workspace Settings", href: `/workspace/${workspaceId}/settings` },
          { label: "Organization Profile" },
        ]}
      />

      <Card className="max-w-xl p-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold">Organization Profile</h1>
          <p className="mt-1 text-sm text-slate-400">
            The account-level organization this workspace belongs to. Your
            plan is billed to this organization, and any other workspaces
            under the same account share it.
          </p>
        </div>

        {loading && <p className="text-slate-400 text-sm">Loading...</p>}

        {!loading && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wide text-slate-500">
                Organization Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!canEdit}
                className="w-full p-3 rounded-lg text-black disabled:opacity-60"
              />
            </div>

            {tier && (
              <p className="text-xs text-slate-500">
                Plan tier: <span className="uppercase">{tier}</span>
              </p>
            )}

            {!canEdit && (
              <p className="text-amber-400 text-sm">
                Only workspace owners or admins can edit the organization
                profile.
              </p>
            )}

            {canEdit && (
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
    </WorkspaceShell>
  );
}
