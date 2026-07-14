"use client";

import { useState } from "react";

export default function GrantAlignmentMatrixPanel({
  workspaceId,
  documentId,
  userId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [matrix, setMatrix] = useState(null);

  async function generateMatrix() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/alignment`,
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
      setMatrix(data.matrix || null);
    } catch (err) {
      console.error("Alignment matrix generation failed:", err);
    }

    setLoading(false);
  }

  function getColor(score) {
    if (score >= 85) return "bg-green-200";
    if (score >= 65) return "bg-blue-200";
    if (score >= 40) return "bg-yellow-200";
    return "bg-red-200";
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Alignment Matrix</h2>

      <button
        onClick={generateMatrix}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {loading ? "Analyzing…" : "Generate Alignment Matrix"}
      </button>

      {!matrix && !loading && (
        <div className="text-gray-500">No alignment matrix yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI mapping alignment…</div>
      )}

      {matrix && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-blue-50">
            <div className="text-sm font-medium">Overall Alignment</div>
            <div className="text-3xl font-bold text-blue-700">
              {matrix.overallScore}%
            </div>
          </div>

          {matrix.rows.map((row, i) => (
            <div key={i} className="border rounded-md p-3 bg-gray-50 space-y-3">
              <div className="text-sm font-semibold text-blue-700">
                {row.section}
              </div>

              <div className="space-y-2">
                {row.criteria.map((crit, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-md ${getColor(crit.score)}`}
                  >
                    <div className="text-xs font-medium">
                      {crit.label}: {crit.score}%
                    </div>
                    <div className="text-xs text-gray-700">
                      {crit.notes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {matrix.recommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Recommendations to Improve Alignment
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {matrix.recommendations.map((r, idx) => (
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
