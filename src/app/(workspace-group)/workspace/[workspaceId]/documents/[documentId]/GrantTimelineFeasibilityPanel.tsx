"use client"

import { useState } from "react";

export default function GrantTimelineFeasibilityPanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState(null);

  async function analyzeTimeline() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/timeline`,
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
      setTimeline(data.timeline || null);

      if (data.output) {
        setContent(JSON.stringify(data.output, null, 2));
      }
    } catch (err) {
      console.error("Timeline feasibility analysis failed:", err);
    }

    setLoading(false);
  }

  function getColor(score) {
    if (score >= 85) return "bg-green-200";     // highly feasible
    if (score >= 65) return "bg-blue-200";      // feasible
    if (score >= 45) return "bg-yellow-200";    // risky
    return "bg-red-300";                        // not feasible
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Timeline Feasibility Analyzer</h2>

      <button
        onClick={analyzeTimeline}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        {loading ? "Analyzing…" : "Analyze Timeline"}
      </button>

      {!timeline && !loading && (
        <div className="text-gray-500">No timeline report yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI evaluating timeline feasibility…</div>
      )}

      {timeline && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-indigo-50">
            <div className="text-sm font-medium">Overall Timeline Feasibility</div>
            <div className="text-3xl font-bold text-indigo-700">
              {timeline.overallScore}%
            </div>
          </div>

          {timeline.sections.map((section, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(section.score)} space-y-2`}
            >
              <div className="text-sm font-medium">
                {section.label}
              </div>

              <div className="text-sm font-semibold">
                Feasibility Score: {section.score}%
              </div>

              <div className="text-xs text-gray-700">
                {section.text}
              </div>

              {section.milestones && (
                <div>
                  <div className="text-xs font-medium text-blue-700">
                    Milestones
                  </div>
                  <ul className="text-xs text-blue-700 list-disc ml-4">
                    {section.milestones.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.risks && (
                <div>
                  <div className="text-xs font-medium text-red-700">
                    Timeline Risks
                  </div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {section.risks.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.dependencies && (
                <div>
                  <div className="text-xs font-medium text-orange-700">
                    Dependencies
                  </div>
                  <ul className="text-xs text-orange-700 list-disc ml-4">
                    {section.dependencies.map((d, idx) => (
                      <li key={idx}>{d}</li>
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

          {timeline.globalRecommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Global Timeline Improvements
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {timeline.globalRecommendations.map((r, idx) => (
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
