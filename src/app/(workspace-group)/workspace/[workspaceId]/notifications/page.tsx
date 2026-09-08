"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

function grantIdFromType(type: string): string | null {
  const match = type.match(/^grant_match:(.+)$/);
  return match ? match[1] : null;
}

export default function WorkspaceNotificationsPage() {
  const routeParams = useParams();
  const router = useRouter();
  const workspaceId = routeParams.workspaceId as string;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/notifications/list`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load notifications");
        if (!cancelled) setNotifications(data.notifications || []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load notifications");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (workspaceId) {
      load();
      fetch(`/api/workspaces/${workspaceId}/notifications/mark-read`, { method: "POST" }).catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  return (
    <WorkspaceShell title="Workspace Notifications" workspaceId={workspaceId}>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: `/workspace/${workspaceId}` },
          { label: "Notifications" },
        ]}
      />

      {loading && <p className="mt-4 text-slate-400">Loading notifications...</p>}
      {error && <p className="mt-4 text-red-400">{error}</p>}

      {!loading && !error && notifications.length === 0 && (
        <Card className="mt-4 p-8 text-center">
          <p className="text-slate-400">No notifications yet.</p>
        </Card>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Card className="mt-4 p-0 overflow-hidden">
          <ul className="divide-y divide-white/[0.06]">
            {notifications.map((n) => {
              const grantId = grantIdFromType(n.type);
              return (
                <li
                  key={n.id}
                  onClick={() => grantId && router.push(`/workspace/${workspaceId}/grants/${grantId}`)}
                  className={`px-5 py-4 ${grantId ? "cursor-pointer hover:bg-white/[0.03]" : ""} ${!n.read ? "bg-white/[0.02]" : ""}`}
                >
                  <p className="text-[13.5px] text-slate-200">{n.message}</p>
                  <p className="mt-1 text-[11.5px] text-slate-500">{new Date(n.createdAt).toLocaleString()}</p>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </WorkspaceShell>
  );
}
