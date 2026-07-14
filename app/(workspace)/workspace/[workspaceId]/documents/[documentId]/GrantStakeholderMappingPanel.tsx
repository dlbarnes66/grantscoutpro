"use client";

import { useState } from "react";

export default function GrantStakeholderMappingPanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [stakeholders, setStakeholders] = useState(null);

  async function analyzeStakeholders() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/stakeholders`,
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
      setStakeholders(data.stakeholders || null);

      if (data.output) {
        setContent(JSON.stringify(data.output, null, 2));
      }
    } catch (err) {
      console.error("Stakeholder mapping failed:", err);
    }

    setLoading(false);
  }

  function getColor(level) {
    if (level === "high") return "bg-green-200";     // strong support / high influence
    if (level === "medium") return "bg-blue-200";    // moderate influence
    if (level === "low") return "bg-yellow-200";     // low influence
    return "bg-red-300";                             // resistance or risk
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Stakeholder Mapping Engine</h2>

      <button
        onClick={analyzeStakeholders}
        className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
      >
        {loading ? "Mapping…" : "Generate Stakeholder Map"}
      </button>

      {!stakeholders && !loading && (
        <div className="text-gray-500">No stakeholder map yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI analyzing stakeholders…</div>
      )}

      {stakeholders && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-purple-50">
            <div className="text-sm font-medium">Overall Stakeholder Alignment</div>
            <div className="text-3xl font-bold text-purple-700">
              {stakeholders.overallScore}%
            </div>
          </div>

          {stakeholders.list.map((stake, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(stake.influence)} space-y-2`}
            >
              <div className="text-sm font-medium">
                {stake.name}
              </div>

              <div className="text-sm font-semibold capitalize">
                Influence: {stake.influence}
              </div>

              <div className="text-sm font-semibold capitalize">
                Interest: {stake.interest}
              </div>

              <div className="text-xs text-gray-700">
                {stake.description}
              </div>

              {stake.risks && (
                <div>
                  <div className="text-xs font-medium text-red-700">
                    Risks
                  </div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {stake.risks.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {stake.support && (
                <div>
                  <div className="text-xs font-medium text-green-700">
                    Support Level
                  </div>
                  <ul className="text-xs text-green-700 list-disc ml-4">
                    {stake.support.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {stake.recommendations && (
                <div>
                  <div className="text-xs font-medium text-blue-700">
                    Engagement Recommendations
                  </div>
                  <ul className="text-xs text-blue-700 list-disc ml-4">
                    {stake.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {stakeholders.globalRecommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Global Stakeholder Strategies
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {stakeholders.globalRecommendations.map((r, idx) => (
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
