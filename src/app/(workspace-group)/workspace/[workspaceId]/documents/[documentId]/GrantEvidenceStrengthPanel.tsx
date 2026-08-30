"use client"

import { useState } from "react";

export default function GrantEvidenceStrengthPanel({
  workspaceId,
  documentId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [evidence, setEvidence] = useState(null);

  async function runEvidence() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspace/${workspaceId}/documents/${documentId}/ai/evidence`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content })
        }
      );

      const data = await res.json();
      setEvidence(data.evidence || null);
    } catch (err) {
      console.error("Evidence analysis failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">AI Evidence Strength</h2>

      <button
        onClick={runEvidence}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md"
      >
        {loading ? "Analyzing…" : "Analyze Evidence"}
      </button>

      {!evidence && !loading && (
        <div className="text-gray-500">No evidence report yet.</div>
      )}

      {loading && <div className="text-gray-500">AI analyzing evidence…</div>}

      {evidence && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border p-3 rounded bg-indigo-50">
            <div className="text-sm font-medium">Strength Score</div>
            <div className="text-2xl font-bold text-indigo-700">
              {evidence.strengthScore || "Unknown"}
            </div>
          </div>

          {Array.isArray(evidence.gaps) &&
            evidence.gaps.length > 0 && (
              <div className="border p-3 rounded bg-red-50">
                <div className="text-sm font-medium text-red-700">
                  Evidence Gaps
                </div>
                <ul className="text-xs text-red-600 list-disc ml-4">
                  {evidence.gaps.map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>
              </div>
            )}

          {Array.isArray(evidence.recommendations) &&
            evidence.recommendations.length > 0 && (
              <div className="border p-3 rounded bg-green-50">
                <div className="text-sm font-medium text-green-700">
                  Recommendations
                </div>
                <ul className="text-xs text-green-700 list-disc ml-4">
                  {evidence.recommendations.map((r, idx) => (
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
