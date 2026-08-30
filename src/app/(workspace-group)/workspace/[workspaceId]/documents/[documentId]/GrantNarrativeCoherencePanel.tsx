"use client"

import { useState } from "react";

export default function GrantNarrativeCoherencePanel({
  workspaceId,
  documentId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [coherence, setCoherence] = useState(null);

  async function runCoherence() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspace/${workspaceId}/documents/${documentId}/ai/coherence`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content })
        }
      );

      const data = await res.json();
      setCoherence(data.coherence || null);
    } catch (err) {
      console.error("Coherence failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">AI Narrative Coherence</h2>

      <button
        onClick={runCoherence}
        className="mb-4 px-4 py-2 bg-teal-600 text-white rounded-md"
      >
        {loading ? "Analyzing…" : "Analyze Coherence"}
      </button>

      {!coherence && !loading && (
        <div className="text-gray-500">No coherence report yet.</div>
      )}

      {loading && <div className="text-gray-500">AI analyzing coherence…</div>}

      {coherence && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border p-3 rounded bg-teal-50">
            <div className="text-sm font-medium">Coherence Score</div>
            <div className="text-2xl font-bold text-teal-700">
              {coherence.coherenceScore || "Unknown"}
            </div>
          </div>

          {Array.isArray(coherence.strengths) &&
            coherence.strengths.length > 0 && (
              <div className="border p-3 rounded bg-green-50">
                <div className="text-sm font-medium text-green-700">
                  Strengths
                </div>
                <ul className="text-xs text-green-700 list-disc ml-4">
                  {coherence.strengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

          {Array.isArray(coherence.weaknesses) &&
            coherence.weaknesses.length > 0 && (
              <div className="border p-3 rounded bg-red-50">
                <div className="text-sm font-medium text-red-700">
                  Weaknesses
                </div>
                <ul className="text-xs text-red-700 list-disc ml-4">
                  {coherence.weaknesses.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
