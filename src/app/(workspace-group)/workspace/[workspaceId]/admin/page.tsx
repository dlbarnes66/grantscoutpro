"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSection from "@/components/workspace/admin/AdminSection";
import MembersSection from "@/components/workspace/admin/MembersSection";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function AdminConsolePage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/admin`);
        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load admin console:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [workspaceId]);

  return (
    <WorkspaceShell title="Workspace Admin Console" workspaceId={workspaceId}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Workspace Admin Console</h1>

        {loading && <p className="text-gray-600">Loading...</p>}

        {data && (
          <div className="space-y-8">
            <AdminSection title="Workspace Summary" data={data.summary} />
            <MembersSection workspaceId={workspaceId} />
            <AdminSection title="Billing" data={data.billing} />
            <AdminSection title="Usage" data={data.usage} />
            <AdminSection title="Recent Activity" data={data.activity} />
            <AdminSection title="AI Insights" data={data.insights} />
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}
