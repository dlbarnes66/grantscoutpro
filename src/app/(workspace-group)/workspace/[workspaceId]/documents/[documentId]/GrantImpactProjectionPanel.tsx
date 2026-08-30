"use client"

import { useState } from "react";

export default function GrantImpactProjectionPanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [impact, setImpact] = useState(null);

  async function analyzeImpact() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspace/${workspaceId}/documents/${documentId}/ai/impact`,
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
      setImpact(data.impact || null);

      if (data.output) {
        setContent(JSON.stringify(data.output, null, 2));
      }
    } catch (err) {
      console.error("Impact projection failed:", err);
    }

    setLoading(false);
  }

  function getColor(score) {
    if (score >= 85) return "bg-green-200";
    if (score >= 65) return "bg-blue-200";
    if (score >= 45) return "bg-yellow-200";
    return "bg-red-200";
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Impact Projection</h2>

      <button
        onClick={analyzeImpact}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        {loading ? "Projecting…" : "Generate Impact Projection"}
      </button>

      {!impact && !loading && (
        <div className="text-gray-500">No impact projection yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI projecting impact…</div>
      )}

      {impact && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-indigo-50">
            <div className="text-sm font-medium">Overall Impact Score</div>
            <div className="text-3xl font-bold text-indigo-700">
              {impact.overallScore}%
            </div>
          </div>

          {impact.sections.map((section, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(section.score)} space-y-2`}
            >
              <div className="text-sm font-medium">
                {section.label}
              </div>

              <div className="text-sm font-semibold">
                Impact Score: {section.score}%
              </div>

              <div className="text-xs text-gray-700">
                {section.text}
              </div>

              {section.projections && (
                <div>
                  <div className="text-xs font-medium text-blue-700">
                    Projections
                  </div>
                  <ul className="text-xs text-blue-700 list-disc ml-4">
                    {section.projections.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.issues && (
                <div>
                  <div className="text-xs font-medium text-red-700">
                    Impact Weaknesses
                  </div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {section.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
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

          {impact.globalRecommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Global Impact Improvements
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {impact.globalRecommendations.map((r, idx) => (
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
