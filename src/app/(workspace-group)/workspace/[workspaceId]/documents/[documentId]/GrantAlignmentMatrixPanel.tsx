"use client"

import { useState } from "react";

export default function GrantAlignmentMatrixPanel() {
  const [loading, setLoading] = useState(false);
  const [matrix, setMatrix] = useState(null);

  async function runMatrix() {
    setLoading(true);

    try {
      const res = await fetch("/api/ai/alignment-matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "Grant content goes here" })
      });

      const data = await res.json();
      setMatrix(data.matrix || null);
    } catch (err) {
      console.error("Alignment matrix failed:", err);
    }

    setLoading(false);
  }

  function getColor(score) {
    if (score >= 85) return "bg-green-200";
    if (score >= 65) return "bg-blue-200";
    if (score >= 45) return "bg-yellow-200";
    return "bg-red-300";
  }

  return (
    <div className="w-full border rounded-lg bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Alignment Matrix</h2>

      <button
        onClick={runMatrix}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {loading ? "Analyzing…" : "Run Alignment Analysis"}
      </button>

      {!matrix && !loading && (
        <div className="text-gray-500">No alignment analysis yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI analyzing funder alignment…</div>
      )}

      {matrix && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-gray-100">
            <div className="text-sm font-medium">Overall Alignment Score</div>
            <div className="text-3xl font-bold text-gray-800">
              {matrix.overallScore}%
            </div>
          </div>

          {matrix.categories.map((cat, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(cat.score)} space-y-2`}
            >
              <div className="text-sm font-medium">{cat.name}</div>
              <div className="text-sm font-semibold">Score: {cat.score}%</div>
              <div className="text-xs text-gray-700">{cat.summary}</div>
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
