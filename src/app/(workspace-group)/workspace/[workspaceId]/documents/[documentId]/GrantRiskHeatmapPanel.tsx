"use client"

import { useState } from "react";

export default function GrantRiskHeatmapPanel({
  workspaceId,
  documentId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [heatmap, setHeatmap] = useState(null);

  async function runHeatmap() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/risk-heatmap`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content })
        }
      );

      if (!res.ok) {

        throw new Error(`Request failed (${res.status})`);

      }

      const data = await res.json();
      setHeatmap(data.riskHeatmap || null);
    } catch (err) {
      console.error("Heatmap failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">AI Risk Heatmap</h2>

      <button
        onClick={runHeatmap}
        className="mb-4 px-4 py-2 bg-red-700 text-white rounded-md"
      >
        {loading ? "Analyzing…" : "Generate Heatmap"}
      </button>

      {!heatmap && !loading && (
        <div className="text-gray-500">No heatmap yet.</div>
      )}

      {loading && <div className="text-gray-500">AI generating heatmap…</div>}

      {heatmap && (
        <div className="space-y-4 overflow-y-auto flex-1">
          {heatmap.sections?.map((section, idx) => (
            <div
              key={idx}
              className="border p-3 rounded bg-red-50 space-y-1"
            >
              <div className="text-sm font-medium">{section.section}</div>
              <div className="text-xs text-red-700">
                Risk Level: {section.riskLevel}
              </div>
              <div className="text-xs text-gray-700">{section.notes}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
