"use client"

import { useState } from "react";

export default function GrantInnovationDetectorPanel({
  workspaceId,
  documentId,
  userId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [innovation, setInnovation] = useState(null);

  async function generateInnovationReport() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspace/${workspaceId}/documents/${documentId}/ai/innovation`,
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
    } catch (err) {
      console.error("Innovation detection failed:", err);
    }

    setLoading(false);
  }

  function getColor(level) {
    if (level === "high") return "bg-purple-300";
    if (level === "medium") return "bg-blue-200";
    if (level === "low") return "bg-gray-200";
    return "bg-yellow-200"; // generic or weak innovation
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Innovation Detector</h2>

      <button
        onClick={generateInnovationReport}
        className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
      >
        {loading ? "Analyzing…" : "Detect Innovation"}
      </button>

      {!innovation && !loading && (
        <div className="text-gray-500">No innovation report yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI scanning for innovation signals…</div>
      )}

      {innovation && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-purple-50">
            <div className="text-sm font-medium">Overall Innovation Score</div>
            <div className="text-3xl font-bold text-purple-700">
              {innovation.overallScore}%
            </div>
          </div>

          {innovation.sections.map((section, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(section.level)} space-y-2`}
            >
              <div className="text-sm font-medium">
                {section.label}
              </div>

              <div className="text-sm font-semibold capitalize">
                Innovation Level: {section.level}
              </div>

              <div className="text-xs text-gray-700">
                {section.text}
              </div>

              {section.notes && (
                <div className="text-xs text-gray-600 italic">
                  {section.notes}
                </div>
              )}
            </div>
          ))}

          {innovation.recommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Recommendations to Increase Innovation
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {innovation.recommendations.map((r, idx) => (
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
