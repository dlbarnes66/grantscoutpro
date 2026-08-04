"use client";

import { useState } from "react";

export default function OutcomeBudgetEfficiencyPanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [efficiency, setEfficiency] = useState(null);

  async function analyzeEfficiency() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspace/${workspaceId}/documents/${documentId}/ai/efficiency`,
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
      setEfficiency(data.efficiency || null);

      if (data.output) {
        setContent(JSON.stringify(data.output, null, 2));
      }
    } catch (err) {
      console.error("Efficiency analysis failed:", err);
    }

    setLoading(false);
  }

  function getColor(score) {
    if (score >= 85) return "bg-green-200";     // highly efficient
    if (score >= 65) return "bg-blue-200";      // efficient
    if (score >= 45) return "bg-yellow-200";    // limited efficiency
    return "bg-red-300";                        // inefficient
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">
        Outcome‑to‑Budget Efficiency Analyzer
      </h2>

      <button
        onClick={analyzeEfficiency}
        className="mb-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
      >
        {loading ? "Calculating…" : "Analyze Efficiency"}
      </button>

      {!efficiency && !loading && (
        <div className="text-gray-500">No efficiency report yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI calculating efficiency…</div>
      )}

      {efficiency && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-orange-50">
            <div className="text-sm font-medium">Overall Efficiency Score</div>
            <div className="text-3xl font-bold text-orange-700">
              {efficiency.overallScore}%
            </div>
          </div>

          {efficiency.sections.map((section, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(section.score)} space-y-2`}
            >
              <div className="text-sm font-medium">
                {section.label}
              </div>

              <div className="text-sm font-semibold">
                Efficiency Score: {section.score}%
              </div>

              <div className="text-xs text-gray-700">
                {section.text}
              </div>

              {section.metrics && (
                <div>
                  <div className="text-xs font-medium text-blue-700">
                    Efficiency Metrics
                  </div>
                  <ul className="text-xs text-blue-700 list-disc ml-4">
                    {section.metrics.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.strengths && (
                <div>
                  <div className="text-xs font-medium text-green-700">
                    Efficiency Strengths
                  </div>
                  <ul className="text-xs text-green-700 list-disc ml-4">
                    {section.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.weaknesses && (
                <div>
                  <div className="text-xs font-medium text-red-700">
                    Efficiency Weaknesses
                  </div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {section.weaknesses.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.recommendations && (
                <div>
                  <div className="text-xs font-medium text-blue-700">
                    Recommendations
                  </div>
                  <ul className="text-xs text-blue-700 list-disc ml-4">
                    {section.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {efficiency.globalRecommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Global Efficiency Improvements
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {efficiency.globalRecommendations.map((r, idx) => (
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
