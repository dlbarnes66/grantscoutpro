"use client";

import { useState } from "react";

export default function GrantNarrativeHeatmapPanel({
  workspaceId,
  documentId,
  userId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [heatmap, setHeatmap] = useState(null);

  async function generateHeatmap() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/heatmap`,
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
      console.error("Heatmap generation failed:", err);
    }

    setLoading(false);
  }

  function getColor(score) {
    if (score >= 85) return "bg-green-200";
    if (score >= 65) return "bg-yellow-200";
    if (score >= 40) return "bg-red-200";
    if (score >= 20) return "bg-purple-200";
    return "bg-gray-200";
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Narrative Heatmap</h2>

      <button
        onClick={generateHeatmap}
        className="mb-4 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
      >
        {loading ? "Analyzing…" : "Generate Heatmap"}
      </button>

      {!heatmap && !loading && (
        <div className="text-gray-500">No heatmap generated yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI scanning narrative strength…</div>
      )}

      {heatmap && (
        <div className="space-y-4 overflow-y-auto flex-1">
          {heatmap.sections.map((section, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(section.score)} space-y-2`}
            >
              <div className="text-sm font-medium">
                {section.label}
              </div>

              <div className="text-sm font-semibold">
                Score: {section.score}/100
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
