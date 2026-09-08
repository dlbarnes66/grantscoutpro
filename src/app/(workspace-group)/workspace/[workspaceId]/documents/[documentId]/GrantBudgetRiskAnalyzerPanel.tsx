"use client"

import { useState } from "react";

export default function GrantBudgetRiskAnalyzerPanel() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  async function runAnalysis() {
    setLoading(true);

    try {
      const res = await fetch("/api/ai/budget-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "Grant budget content goes here" })
      });

      if (!res.ok) {

        throw new Error(`Request failed (${res.status})`);

      }

      const data = await res.json();
      setAnalysis(data.analysis || null);
    } catch (err) {
      console.error("Budget risk analysis failed:", err);
    }

    setLoading(false);
  }

  function getColor(score) {
    if (score <= 25) return "bg-green-200";
    if (score <= 50) return "bg-blue-200";
    if (score <= 75) return "bg-yellow-200";
    return "bg-red-300";
  }

  return (
    <div className="w-full border rounded-lg bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Budget Risk Analyzer</h2>

      <button
        onClick={runAnalysis}
        className="mb-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        {loading ? "Analyzing…" : "Run Budget Risk Analysis"}
      </button>

      {!analysis && !loading && (
        <div className="text-gray-500">No budget analysis yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI analyzing budget risks…</div>
      )}

      {analysis && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-gray-100">
            <div className="text-sm font-medium">Overall Budget Risk</div>
            <div className="text-3xl font-bold text-gray-800">
              {analysis.overallRisk}%
            </div>
          </div>

          {analysis.categories.map((cat, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(cat.risk)} space-y-2`}
            >
              <div className="text-sm font-medium">{cat.name}</div>
              <div className="text-sm font-semibold">Risk Level: {cat.risk}%</div>
              <div className="text-xs text-gray-700">{cat.summary}</div>

              {cat.issues?.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-red-700">Issues</div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {cat.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {cat.recommendations?.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-blue-700">Recommendations</div>
                  <ul className="text-xs text-blue-700 list-disc ml-4">
                    {cat.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {analysis.globalRecommendations && (
            <div className="border rounded-md p-3 bg-red-50 space-y-2">
              <div className="text-sm font-medium text-red-700">
                Global Budget Risk Insights
              </div>
              <ul className="text-xs text-red-700 list-disc ml-4">
                {analysis.globalRecommendations.map((ins, idx) => (
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
