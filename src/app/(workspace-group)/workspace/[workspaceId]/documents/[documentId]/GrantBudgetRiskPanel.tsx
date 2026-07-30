"use client";

import { useState } from "react";

export default function GrantBudgetRiskPanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [budgetRisk, setBudgetRisk] = useState(null);

  async function analyzeBudgetRisk() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/budget-risk`,
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
      setBudgetRisk(data.budgetRisk || null);

      if (data.output) {
        setContent(JSON.stringify(data.output, null, 2));
      }
    } catch (err) {
      console.error("Budget risk analysis failed:", err);
    }

    setLoading(false);
  }

  function getColor(score) {
    if (score >= 85) return "bg-green-200";     // low risk
    if (score >= 65) return "bg-blue-200";      // moderate risk
    if (score >= 45) return "bg-yellow-200";    // elevated risk
    return "bg-red-300";                        // high risk
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Budget Risk Analyzer</h2>

      <button
        onClick={analyzeBudgetRisk}
        className="mb-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        {loading ? "Analyzing…" : "Analyze Budget Risk"}
      </button>

      {!budgetRisk && !loading && (
        <div className="text-gray-500">No budget risk report yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI evaluating budget risk…</div>
      )}

      {budgetRisk && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-red-50">
            <div className="text-sm font-medium">Overall Budget Risk</div>
            <div className="text-3xl font-bold text-red-700">
              {budgetRisk.overallScore}%
            </div>
          </div>

          {budgetRisk.sections.map((section, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(section.score)} space-y-2`}
            >
              <div className="text-sm font-medium">
                {section.label}
              </div>

              <div className="text-sm font-semibold">
                Risk Score: {section.score}%
              </div>

              <div className="text-xs text-gray-700">
                {section.text}
              </div>

              {section.risks && (
                <div>
                  <div className="text-xs font-medium text-red-700">
                    Budget Risks
                  </div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {section.risks.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.strengths && (
                <div>
                  <div className="text-xs font-medium text-green-700">
                    Budget Strengths
                  </div>
                  <ul className="text-xs text-green-700 list-disc ml-4">
                    {section.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.metrics && (
                <div>
                  <div className="text-xs font-medium text-blue-700">
                    Budget Metrics
                  </div>
                  <ul className="text-xs text-blue-700 list-disc ml-4">
                    {section.metrics.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.recommendations && (
                <div>
                  <div className="text-xs font-medium text-green-700">
                    Recommendations
                  </div>
                  <ul className="text-xs text-green-700 list-disc ml-4">
                    {section.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {budgetRisk.globalRecommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Global Budget Risk Reductions
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {budgetRisk.globalRecommendations.map((r, idx) => (
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
