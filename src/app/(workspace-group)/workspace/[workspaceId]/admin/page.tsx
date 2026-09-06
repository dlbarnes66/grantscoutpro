"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSection from "@/components/workspace/admin/AdminSection";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function AdminConsolePage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/admin`);
      const json = await res.json();
      setData(json);
      setLoading(false);
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
            <AdminSection title="Members" data={data.members} />
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
