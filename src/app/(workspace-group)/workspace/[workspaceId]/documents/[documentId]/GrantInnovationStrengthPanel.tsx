"use client"

import { useState } from "react";

export default function GrantInnovationStrengthPanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [innovation, setInnovation] = useState(null);

  async function analyzeInnovation() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/innovation`,
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
      setInnovation(data.innovation || null);

      if (data.output) {
        setContent(JSON.stringify(data.output, null, 2));
      }
    } catch (err) {
      console.error("Innovation analysis failed:", err);
    }

    setLoading(false);
  }

  function getColor(score) {
    if (score >= 85) return "bg-green-200";     // highly innovative
    if (score >= 65) return "bg-blue-200";      // innovative
    if (score >= 45) return "bg-yellow-200";    // limited innovation
    return "bg-red-300";                        // not innovative
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Innovation Strength Scorer</h2>

      <button
        onClick={analyzeInnovation}
        className="mb-4 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
      >
        {loading ? "Analyzing…" : "Analyze Innovation Strength"}
      </button>

      {!innovation && !loading && (
        <div className="text-gray-500">No innovation report yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI evaluating innovation strength…</div>
      )}

      {innovation && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-pink-50">
            <div className="text-sm font-medium">Overall Innovation Score</div>
            <div className="text-3xl font-bold text-pink-700">
              {innovation.overallScore}%
            </div>
          </div>

          {innovation.sections.map((section, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(section.score)} space-y-2`}
            >
              <div className="text-sm font-medium">{section.label}</div>

              <div className="text-sm font-semibold">
                Innovation Score: {section.score}%
              </div>

              <div className="text-xs text-gray-700">{section.text}</div>

              {section.strengths && (
                <div>
                  <div className="text-xs font-medium text-green-700">
                    Innovation Strengths
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
                    Innovation Weaknesses
                  </div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {section.weaknesses.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.opportunities && (
                <div>
                  <div className="text-xs font-medium text-blue-700">
                    Innovation Opportunities
                  </div>
                  <ul className="text-xs text-blue-700 list-disc ml-4">
                    {section.opportunities.map((o, idx) => (
                      <li key={idx}>{o}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.risks && (
                <div>
                  <div className="text-xs font-medium text-orange-700">
                    Innovation Risks
                  </div>
                  <ul className="text-xs text-orange-700 list-disc ml-4">
                    {section.risks.map((r, idx) => (
                      <li key={idx}>{r}</li>
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

          {innovation.globalRecommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Global Innovation Improvements
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {innovation.globalRecommendations.map((r, idx) => (
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
