"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function InsightsPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/insights`);
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }
      const json = await res.json();
      setInsights(json.insights || []);
    } catch (err) {
      console.error("Failed to load insights:", err);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [workspaceId]);

  const generate = async () => {
    setGenerating(true);
    await fetch(`/api/workspaces/${workspaceId}/insights`, {
      method: "POST",
    });
    await load();
    setGenerating(false);
  };

  return (
    <WorkspaceShell title="AI Insights" workspaceId={workspaceId}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">AI Insights</h1>

          <button
            onClick={generate}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {generating ? "Generating..." : "Generate New Insights"}
          </button>
        </div>

        {loading && <p className="text-gray-600">Loading...</p>}

        <div className="space-y-6">
          {insights.map((i) => (
            <div
              key={i.id}
              className="border rounded-lg p-4 bg-white shadow-sm space-y-3"
            >
              <p className="font-semibold text-xl">{i.summary}</p>

              <pre className="text-xs text-gray-700 bg-gray-100 p-3 rounded">
                {JSON.stringify(i.metadata, null, 2)}
              </pre>

              <p className="text-sm text-gray-600">
                {new Date(i.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
}
