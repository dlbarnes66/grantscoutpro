"use client";

import { useEffect, useState } from "react";
import DashboardCard from "./DashboardCard";
import TrialBanner from "./TrialBanner";

export default function WorkspaceDashboard({
  params
}: {
  params: { workspaceId: string };
}) {
  const workspaceId = params.workspaceId;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/workspace/${workspaceId}/dashboard`);
      const json = await res.json();
      setData(json);
      setLoading(false);
    }
    load();
  }, [workspaceId]);

  if (loading) {
    return <p className="p-6 text-lg">Loading dashboard...</p>;
  }

  const { workspace, grants, upcomingDeadlines, ai } = data;

  // ⭐ If workspace is locked → redirect to lock screen
  if (workspace.isLocked) {
    window.location.href = `/dashboard/workspace/${workspaceId}/locked`;
    return null;
  }

  return (
    <div className="space-y-8 p-6">
      {/* ⭐ Trial Banner */}
      <TrialBanner workspaceId={workspaceId} />

      <h1 className="text-3xl font-bold">{workspace.name} — Dashboard</h1>

      <p className="text-gray-700">{ai.summary}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard title="Active Grants" items={grants} type="grants" />
        <DashboardCard title="Upcoming Deadlines" items={upcomingDeadlines} type="deadlines" />
        <DashboardCard title="AI Alerts" items={ai.alerts} type="list" />
        <DashboardCard title="Risks" items={ai.risks} type="list" />
        <DashboardCard title="Missing Items" items={ai.missing} type="list" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <a
          href={`/dashboard/workspace/${workspaceId}/search`}
          className="p-4 bg-blue-600 text-white rounded-md text-center font-semibold"
        >
          Search Grants
        </a>

        <a
          href={`/dashboard/workspace/${workspaceId}/recommended`}
          className="p-4 bg-green-600 text-white rounded-md text-center font-semibold"
        >
          Recommended Grants
        </a>

        <a
          href={`/dashboard/workspace/${workspaceId}/tracking`}
          className="p-4 bg-purple-600 text-white rounded-md text-center font-semibold"
        >
          Grant Tracking
        </a>

        <a
          href={`/dashboard/workspace/${workspaceId}/grant`}
          className="p-4 bg-orange-600 text-white rounded-md text-center font-semibold"
        >
          Grant Workspace
        </a>
      </div>
    </div>
  );
}
