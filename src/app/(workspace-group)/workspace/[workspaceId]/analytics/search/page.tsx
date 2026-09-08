"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function SearchAnalyticsPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/analytics/search`);
        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }
        const json = await res.json();
        setAnalytics(json.analytics || []);
      } catch (err) {
        console.error("Failed to load search analytics:", err);
        setAnalytics([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [workspaceId]);

  return (
    <WorkspaceShell title="Search Analytics" workspaceId={workspaceId}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Search Analytics</h1>

        {loading && <p className="text-gray-600">Loading...</p>}

        <div className="space-y-4">
          {analytics.map((a) => (
            <div
              key={a.id}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <p className="font-semibold">Query: {a.query}</p>

              <p className="text-sm text-gray-600 mt-1">
                Searches: {a.count}
              </p>

              <p className="text-sm text-gray-600">
                Last searched: {new Date(a.lastSearchedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
}
