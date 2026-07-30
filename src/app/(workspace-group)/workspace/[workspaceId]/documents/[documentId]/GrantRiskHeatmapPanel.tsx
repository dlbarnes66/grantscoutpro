"use client";

import { useState } from "react";

export default function GrantRiskHeatmapPanel({
  workspaceId,
  documentId,
  userId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [heatmap, setHeatmap] = useState(null);

  async function generateRiskHeatmap() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/risk-heatmap`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            content: JSON.parse(content)
          })
        }
      );

      const data = await res.json();
      setHeatmap(data.heatmap || null);
    } catch (err) {
      console.error("Risk heatmap generation failed:", err);
    }

    setLoading(false);
  }

  function getColor(level) {
    if (level === "critical") return "bg-red-300";
    if (level === "high") return "bg-orange-300";
    if (level === "medium") return "bg-yellow-300";
    if (level === "low") return "bg-gray-200";
    return "bg-blue-200"; // structural issues
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Risk Heatmap</h2>

      <button
        onClick={generateRiskHeatmap}
        className="mb-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        {loading ? "Analyzing…" : "Generate Risk Heatmap"}
      </button>

      {!heatmap && !loading && (
        <div className="text-gray-500">No risk heatmap generated yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI scanning for risks…</div>
      )}

      {heatmap && (
        <div className="space-y-4 overflow-y-auto flex-1">
          {heatmap.sections.map((section, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(section.level)} space-y-2`}
            >
              <div className="text-sm font-medium">
                {section.label}
              </div>

              <div className="text-sm font-semibold capitalize">
                Risk Level: {section.level}
              </div>

              <div className="text-xs text-gray-700">
                {section.text}
              </div>

              {section.notes && (
                <div className="text-xs text-gray-600 italic">
                  {section.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
