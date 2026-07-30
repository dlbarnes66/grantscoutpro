"use client";

import { useState } from "react";

export default function MultiYearImpactForecasterPanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null);

  async function analyzeForecast() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/multi-year-impact`,
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
      setForecast(data.forecast || null);

      if (data.output) {
        setContent(JSON.stringify(data.output, null, 2));
      }
    } catch (err) {
      console.error("Multi-year impact forecasting failed:", err);
    }

    setLoading(false);
  }

  function getColor(score) {
    if (score >= 85) return "bg-green-200";     // strong long-term impact
    if (score >= 65) return "bg-blue-200";      // good long-term impact
    if (score >= 45) return "bg-yellow-200";    // limited long-term impact
    return "bg-red-300";                        // weak long-term impact
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Multi‑Year Impact Forecaster</h2>

      <button
        onClick={analyzeForecast}
        className="mb-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
      >
        {loading ? "Forecasting…" : "Generate Multi‑Year Forecast"}
      </button>

      {!forecast && !loading && (
        <div className="text-gray-500">No multi‑year forecast yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI projecting long‑term impact…</div>
      )}

      {forecast && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-teal-50">
            <div className="text-sm font-medium">Overall Long‑Term Impact Score</div>
            <div className="text-3xl font-bold text-teal-700">
              {forecast.overallScore}%
            </div>
          </div>

          {forecast.years.map((year, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(year.score)} space-y-2`}
            >
              <div className="text-sm font-medium">
                Year {year.year}
              </div>

              <div className="text-sm font-semibold">
                Impact Score: {year.score}%
              </div>

              <div className="text-xs text-gray-700">
                {year.text}
              </div>

              {year.metrics && (
                <div>
                  <div className="text-xs font-medium text-blue-700">
                    Growth Metrics
                  </div>
                  <ul className="text-xs text-blue-700 list-disc ml-4">
                    {year.metrics.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {year.risks && (
                <div>
                  <div className="text-xs font-medium text-red-700">
                    Growth Risks
                  </div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {year.risks.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {year.recommendations && (
                <div>
                  <div className="text-xs font-medium text-green-700">
                    Recommendations
                  </div>
                  <ul className="text-xs text-green-700 list-disc ml-4">
                    {year.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {forecast.globalRecommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Global Long‑Term Impact Improvements
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {forecast.globalRecommendations.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
