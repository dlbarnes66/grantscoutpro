"use client"

import { useState } from "react";

export default function GrantNarrativeHeatmapPanel() {
  const [loading, setLoading] = useState(false);
  const [heatmap, setHeatmap] = useState(null);

  async function runHeatmap() {
    setLoading(true);

    try {
      const res = await fetch("/api/ai/narrative-heatmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "Grant content goes here" })
      });

      const data = await res.json();
      setHeatmap(data.heatmap || null);
    } catch (err) {
      console.error("Heatmap analysis failed:", err);
    }

    setLoading(false);
  }

  function getColor(score) {
    if (score >= 85) return "bg-green-200";
    if (score >= 65) return "bg-blue-200";
    if (score >= 45) return "bg-yellow-200";
    return "bg-red-300";
  }

  return (
    <div className="w-full border rounded-lg bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Narrative Heatmap</h2>

      <button
        onClick={runHeatmap}
        className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
      >
        {loading ? "Analyzing…" : "Generate Narrative Heatmap"}
      </button>

      {!heatmap && !loading && (
        <div className="text-gray-500">No narrative analysis yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI analyzing narrative strength…</div>
      )}

      {heatmap && (
        <div className="space-y-4 overflow-y-auto flex-1">
          {heatmap.sections.map((sec, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(sec.score)} space-y-2`}
            >
              <div className="text-sm font-medium">{sec.title}</div>
              <div className="text-sm font-semibold">Score: {sec.score}%</div>
              <div className="text-xs text-gray-700">{sec.summary}</div>

              {sec.issues?.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-red-700">Issues</div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {sec.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {sec.highlights?.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-green-700">Highlights</div>
                  <ul className="text-xs text-green-700 list-disc ml-4">
                    {sec.highlights.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {heatmap.globalInsights && (
            <div className="border rounded-md p-3 bg-indigo-50 space-y-2">
              <div className="text-sm font-medium text-indigo-700">
                Global Narrative Insights
              </div>
              <ul className="text-xs text-indigo-700 list-disc ml-4">
                {heatmap.globalInsights.map((ins, idx) => (
                  <li key={idx}>{ins}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
