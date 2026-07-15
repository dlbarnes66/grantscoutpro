"use client";

import { useState } from "react";

export default function GrantScalabilityPredictorPanel() {
  const [loading, setLoading] = useState(false);
  const [scalability, setScalability] = useState(null);

  async function runPrediction() {
    setLoading(true);

    try {
      const res = await fetch("/api/ai/scalability-predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "Grant content goes here" })
      });

      const data = await res.json();
      setScalability(data.scalability || null);
    } catch (err) {
      console.error("Scalability prediction failed:", err);
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
      <h2 className="text-lg font-semibold mb-4">Grant Scalability Predictor</h2>

      <button
        onClick={runPrediction}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        {loading ? "Predicting…" : "Run Scalability Prediction"}
      </button>

      {!scalability && !loading && (
        <div className="text-gray-500">No scalability analysis yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI evaluating scalability…</div>
      )}

      {scalability && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-gray-100">
            <div className="text-sm font-medium">Overall Scalability Score</div>
            <div className="text-3xl font-bold text-gray-800">
              {scalability.overallScore}%
            </div>
          </div>

          {scalability.dimensions.map((dim, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(dim.score)} space-y-2`}
            >
              <div className="text-sm font-medium">{dim.name}</div>
              <div className="text-sm font-semibold">Score: {dim.score}%</div>
              <div className="text-xs text-gray-700">{dim.summary}</div>

              {dim.bottlenecks?.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-red-700">Bottlenecks</div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {dim.bottlenecks.map((b, idx) => (
                      <li key={idx}>{b}</li>
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

          {scalability.globalInsights && (
            <div className="border rounded-md p-3 bg-indigo-50 space-y-2">
              <div className="text-sm font-medium text-indigo-700">
                Global Scalability Insights
              </div>
              <ul className="text-xs text-indigo-700 list-disc ml-4">
                {scalability.globalInsights.map((ins, idx) => (
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
