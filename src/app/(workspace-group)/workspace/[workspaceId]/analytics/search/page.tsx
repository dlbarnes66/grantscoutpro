"use client"
import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";




import { useEffect, useState } from "react";

export default function SearchAnalyticsPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;

  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/analytics/search`);
      const json = await res.json();
      setAnalytics(json.analytics || []);
      setLoading(false);
    };

    load();
  }, [workspaceId]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
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
  );
}
