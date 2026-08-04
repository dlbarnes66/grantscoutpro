"use client";

import { useState } from "react";

export default function GrantMultiYearImpactForecasterPanel({
  workspaceId,
  documentId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [impact, setImpact] = useState(null);

  async function runForecast() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspace/${workspaceId}/documents/${documentId}/ai/multi-year-impact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content })
        }
      );

      const data = await res.json();
      setImpact(data.multiYearImpact || null);
    } catch (err) {
      console.error("Impact forecast failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">
        AI Multi‑Year Impact Forecast
      </h2>

      <button
        onClick={runForecast}
        className="mb-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
      >
        {loading ? "Forecasting…" : "Run Impact Forecast"}
      </button>

      {!impact && !loading && (
        <div className="text-gray-500">No impact forecast yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI forecasting multi‑year impact…</div>
      )}

      {impact && (
        <div className="space-y-4 overflow-y-auto flex-1">
          {Array.isArray(impact.years) &&
            impact.years.length > 0 &&
            impact.years.map((yearData, idx) => (
              <div
                key={idx}
                className="border p-3 rounded bg-emerald-50 space-y-2"
              >
                <div className="text-sm font-medium text-emerald-700">
                  Year {yearData.year}
                </div>

                <div className="text-xs text-gray-700">
                  <span className="font-semibold">Impact Summary:</span>{" "}
                  {yearData.impactSummary}
                </div>

                <div className="text-xs text-red-700">
                  <span className="font-semibold">Risks:</span>{" "}
                  {Array.isArray(yearData.risks)
                    ? yearData.risks.join(", ")
                    : "None listed"}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
