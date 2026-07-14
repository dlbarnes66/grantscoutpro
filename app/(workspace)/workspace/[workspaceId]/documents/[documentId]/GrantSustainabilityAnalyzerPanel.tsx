"use client";

import { useState } from "react";

export default function GrantSustainabilityAnalyzerPanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [sustainability, setSustainability] = useState(null);

  async function analyzeSustainability() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/sustainability`,
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
      setSustainability(data.sustainability || null);

      if (data.output) {
        setContent(JSON.stringify(data.output, null, 2));
      }
    } catch (err) {
      console.error("Sustainability analysis failed:", err);
    }

    setLoading(false);
  }

  function getColor(score) {
    if (score >= 85) return "bg-green-200";     // highly sustainable
    if (score >= 65) return "bg-blue-200";      // sustainable
    if (score >= 45) return "bg-yellow-200";    // limited sustainability
    return "bg-red-300";                        // not sustainable
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Sustainability Analyzer</h2>

      <button
        onClick={analyzeSustainability}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        {loading ? "Analyzing…" : "Analyze Sustainability"}
      </button>

      {!sustainability && !loading && (
        <div className="text-gray-500">No sustainability report yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI evaluating sustainability…</div>
      )}

      {sustainability && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-green-50">
            <div className="text-sm font-medium">Overall Sustainability Score</div>
            <div className="text-3xl font-bold text-green-700">
              {sustainability.overallScore}%
            </div>
          </div>

          {sustainability.sections.map((section, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(section.score)} space-y-2`}
            >
              <div className="text-sm font-medium">
                {section.label}
              </div>

              <div className="text-sm font-semibold">
                Sustainability Score: {section.score}%
              </div>

              <div className="text-xs text-gray-700">
                {section.text}
              </div>

              {section.strengths && (
                <div>
                  <div className="text-xs font-medium text-green-700">
                    Sustainability Strengths
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
                    Sustainability Weaknesses
                  </div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {section.weaknesses.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.risks && (
                <div>
                  <div className="text-xs font-medium text-orange-700">
                    Sustainability Risks
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

          {sustainability.globalRecommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Global Sustainability Improvements
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {sustainability.globalRecommendations.map((r, idx) => (
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
