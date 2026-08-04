"use client";

import { useState } from "react";

export default function GrantRiskMitigationStrengthPanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [riskMitigation, setRiskMitigation] = useState(null);

  async function analyzeRiskMitigation() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspace/${workspaceId}/documents/${documentId}/ai/risk-mitigation`,
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
      setRiskMitigation(data.riskMitigation || null);

      if (data.output) {
        setContent(JSON.stringify(data.output, null, 2));
      }
    } catch (err) {
      console.error("Risk‑mitigation analysis failed:", err);
    }

    setLoading(false);
  }

  function getColor(score) {
    if (score >= 85) return "bg-green-200";     // strong mitigation
    if (score >= 65) return "bg-blue-200";      // good mitigation
    if (score >= 45) return "bg-yellow-200";    // limited mitigation
    return "bg-red-300";                        // weak mitigation
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">
        Grant Risk‑Mitigation Strength Analyzer
      </h2>

      <button
        onClick={analyzeRiskMitigation}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        {loading ? "Analyzing…" : "Analyze Risk‑Mitigation Strength"}
      </button>

      {!riskMitigation && !loading && (
        <div className="text-gray-500">No risk‑mitigation report yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI evaluating risk‑mitigation strength…</div>
      )}

      {riskMitigation && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-indigo-50">
            <div className="text-sm font-medium">Overall Risk‑Mitigation Score</div>
            <div className="text-3xl font-bold text-indigo-700">
              {riskMitigation.overallScore}%
            </div>
          </div>

          {riskMitigation.sections.map((section, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(section.score)} space-y-2`}
            >
              <div className="text-sm font-medium">{section.label}</div>

              <div className="text-sm font-semibold">
                Risk‑Mitigation Score: {section.score}%
              </div>

              <div className="text-xs text-gray-700">{section.text}</div>

              {section.risks && (
                <div>
                  <div className="text-xs font-medium text-red-700">
                    Key Risks
                  </div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {section.risks.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.mitigations && (
                <div>
                  <div className="text-xs font-medium text-green-700">
                    Mitigation Strategies
                  </div>
                  <ul className="text-xs text-green-700 list-disc ml-4">
                    {section.mitigations.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.gaps && (
                <div>
                  <div className="text-xs font-medium text-orange-700">
                    Mitigation Gaps
                  </div>
                  <ul className="text-xs text-orange-700 list-disc ml-4">
                    {section.gaps.map((g, idx) => (
                      <li key={idx}>{g}</li>
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

          {riskMitigation.globalRecommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Global Risk‑Mitigation Improvements
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {riskMitigation.globalRecommendations.map((r, idx) => (
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
