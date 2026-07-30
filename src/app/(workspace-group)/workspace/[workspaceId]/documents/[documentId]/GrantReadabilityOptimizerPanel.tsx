"use client";

import { useState } from "react";

export default function GrantReadabilityOptimizerPanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [readability, setReadability] = useState(null);

  async function analyzeReadability() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/readability`,
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
      setReadability(data.readability || null);

      if (data.output) {
        setContent(JSON.stringify(data.output, null, 2));
      }
    } catch (err) {
      console.error("Readability analysis failed:", err);
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
      <h2 className="text-lg font-semibold mb-4">Grant Readability Optimizer</h2>

      <button
        onClick={analyzeReadability}
        className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
      >
        {loading ? "Analyzing…" : "Analyze Readability"}
      </button>

      {!readability && !loading && (
        <div className="text-gray-500">No readability report yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI evaluating readability…</div>
      )}

      {readability && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-purple-50">
            <div className="text-sm font-medium">Overall Readability Score</div>
            <div className="text-3xl font-bold text-purple-700">
              {readability.overallScore}%
            </div>
          </div>

          {readability.sections.map((section, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(section.score)} space-y-2`}
            >
              <div className="text-sm font-medium">
                {section.label}
              </div>

              <div className="text-sm font-semibold">
                Readability Score: {section.score}%
              </div>

              <div className="text-xs text-gray-700">
                {section.text}
              </div>

              {section.issues && (
                <div>
                  <div className="text-xs font-medium text-red-700">
                    Issues
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

          {readability.globalRecommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Global Improvements
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {readability.globalRecommendations.map((r, idx) => (
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
