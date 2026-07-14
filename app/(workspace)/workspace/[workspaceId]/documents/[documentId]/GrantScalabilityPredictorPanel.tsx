"use client";

import { useState } from "react";

export default function GrantScalabilityPredictorPanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [scalability, setScalability] = useState(null);

  async function analyzeScalability() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/scalability`,
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
      setScalability(data.scalability || null);

      if (data.output) {
        setContent(JSON.stringify(data.output, null, 2));
      }
    } catch (err) {
      console.error("Scalability prediction failed:", err);
    }

    setLoading(false);
  }

  function getColor(score) {
    if (score >= 85) return "bg-green-200";     // highly scalable
    if (score >= 65) return "bg-blue-200";      // scalable
    if (score >= 45) return "bg-yellow-200";    // limited scalability
    return "bg-red-300";                        // not scalable
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Scalability Predictor</h2>

      <button
        onClick={analyzeScalability}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        {loading ? "Predicting…" : "Analyze Scalability"}
      </button>

      {!scalability && !loading && (
        <div className="text-gray-500">No scalability report yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI evaluating scalability…</div>
      )}

      {scalability && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-indigo-50">
            <div className="text-sm font-medium">Overall Scalability Score</div>
            <div className="text-3xl font-bold text-indigo-700">
              {scalability.overallScore}%
            </div>
          </div>

          {scalability.sections.map((section, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(section.score)} space-y-2`}
            >
              <div className="text-sm font-medium">
                {section.label}
              </div>

              <div className="text-sm font-semibold">
                Scalability Score: {section.score}%
              </div>

              <div className="text-xs text-gray-700">
                {section.text}
              </div>

              {section.strengths && (
                <div>
                  <div className="text-xs font-medium text-green-700">
                    Scalability Strengths
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
                    Scalability Weaknesses
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
                    Scalability Risks
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

          {scalability.globalRecommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Global Scalability Improvements
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {scalability.globalRecommendations.map((r, idx) => (
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
