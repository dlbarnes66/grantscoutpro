"use client";

import { useState } from "react";

export default function GrantSustainabilityAnalyzerPanel() {
  const [loading, setLoading] = useState(false);
  const [sustainability, setSustainability] = useState(null);

  async function runAnalysis() {
    setLoading(true);

    try {
      const res = await fetch("/api/ai/sustainability-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "Grant content goes here" })
      });

      const data = await res.json();
      setSustainability(data.sustainability || null);
    } catch (err) {
      console.error("Sustainability analysis failed:", err);
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
      <h2 className="text-lg font-semibold mb-4">Grant Sustainability Analyzer</h2>

      <button
        onClick={runAnalysis}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        {loading ? "Analyzing…" : "Run Sustainability Analysis"}
      </button>

      {!sustainability && !loading && (
        <div className="text-gray-500">No sustainability analysis yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI evaluating sustainability…</div>
      )}

      {sustainability && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-gray-100">
            <div className="text-sm font-medium">Overall Sustainability Score</div>
            <div className="text-3xl font-bold text-gray-800">
              {sustainability.overallScore}%
            </div>
          </div>

          {sustainability.dimensions.map((dim, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(dim.score)} space-y-2`}
            >
              <div className="text-sm font-medium">{dim.name}</div>
              <div className="text-sm font-semibold">Score: {dim.score}%</div>
              <div className="text-xs text-gray-700">{dim.summary}</div>

              {dim.risks?.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-red-700">Long-Term Risks</div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {dim.risks.map((risk, idx) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                </div>
              )}

              {dim.recommendations?.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-blue-700">Recommendations</div>
                  <ul className="text-xs text-blue-700 list-disc ml-4">
                    {dim.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {sustainability.globalInsights && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Global Sustainability Insights
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {sustainability.globalInsights.map((ins, idx) => (
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
