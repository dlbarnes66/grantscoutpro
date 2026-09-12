"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Activity as ActivityIcon } from "lucide-react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Card from "@/components/ui/Card";

interface ActivityUser {
  id: string;
  name: string | null;
  email: string | null;
}

interface ActivityEntry {
  id: string;
  action: string;
  metadata: Record<string, any> | null;
  createdAt: string;
  user: ActivityUser | null;
}

// Human-readable labels for the action strings logActivity() writes
// across the app (workspace creation/invites, member changes,
// integrations, and every billing event). Anything not listed here
// falls back to a humanized version of the raw action string, so a
// new event type never disappears from the feed while it waits for a
// proper label.
const ACTION_LABELS: Record<string, string> = {
  workspace_created: "created this workspace",
  invite_sent: "invited a new member",
  member_added: "added a member",
  member_removed: "removed a member",
  member_role_updated: "updated a member's role",
  profile_updated: "updated the workspace profile",
  integration_connected: "connected an integration",
  integration_disconnected: "disconnected an integration",
  checkout_completed: "completed checkout",
  subscription_created: "started a subscription",
  subscription_updated: "updated the subscription",
  subscription_canceled: "canceled the subscription",
  addon_activated: "activated an add-on",
  addon_deactivated: "deactivated an add-on",
  addon_canceled: "canceled an add-on",
  payment_failed: "had a payment fail",
  payment_succeeded: "made a successful payment",
};

function humanizeAction(action: string): string {
  return ACTION_LABELS[action] ?? action.replace(/_/g, " ");
}

function formatMetadata(metadata: Record<string, any> | null): string | null {
  if (!metadata || Object.keys(metadata).length === 0) return null;
  return Object.entries(metadata)
    .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`)
    .join(" · ");
}

function formatTimestamp(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function WorkspaceActivityPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/activity`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load activity");
        setActivity(Array.isArray(json.activity) ? json.activity : []);
      } catch (err: any) {
        setError(err.message || "Failed to load activity");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workspaceId]);

  return (
    <WorkspaceShell title="Workspace Activity" workspaceId={workspaceId}>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: `/workspace/${workspaceId}` },
          { label: "Activity" },
        ]}
      />

      <div className="mb-6 mt-4">
        <h1 className="text-2xl font-semibold text-white">Workspace Activity</h1>
        <p className="mt-1 text-[13px] text-slate-400">
          A running log of what's happened in this workspace - member changes, invites, and billing events.
        </p>
      </div>

      {loading && <div className="text-slate-400">Loading activity…</div>}

      {!loading && error && (
        <Card className="p-4">
          <p className="text-[13px] text-red-400">{error}</p>
        </Card>
      )}

      {!loading && !error && activity.length === 0 && (
        <Card className="p-6">
          <p className="text-slate-300">No activity recorded for this workspace yet.</p>
        </Card>
      )}

      {!loading && !error && activity.length > 0 && (
        <div className="space-y-2">
          {activity.map((entry) => {
            const meta = formatMetadata(entry.metadata);
            const who = entry.user?.name || entry.user?.email || "Someone";
            return (
              <div
                key={entry.id}
                className="flex items-start gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-[#0A1A2F] text-[#00E5FF]">
                  <ActivityIcon size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] text-white">
                    <span className="font-medium">{who}</span>{" "}
                    {humanizeAction(entry.action)}
                  </p>
                  {meta && <p className="mt-1 text-[12px] text-slate-500">{meta}</p>}
                  <p className="mt-1 text-[12px] text-slate-500">{formatTimestamp(entry.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WorkspaceShell>
  );
}
