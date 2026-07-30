"use client";

import { useState } from "react";

export default function FunderMatchPanel({
  workspaceId,
  documentId,
  userId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState(null);

  async function runFunderMatch() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/funders`,
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
      setMatches(data.matches || null);
    } catch (err) {
      console.error("Funder match failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Funder Match</h2>

      <button
        onClick={runFunderMatch}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        {loading ? "Matching…" : "Find Funders"}
      </button>

      {!matches && !loading && (
        <div className="text-gray-500">No funder matches yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI analyzing funder alignment…</div>
      )}

      {matches && (
        <div className="space-y-4 overflow-y-auto flex-1">
          {matches.map((m, i) => (
            <div
              key={i}
              className="border rounded-md p-3 bg-gray-50 space-y-2"
            >
              <div className="text-lg font-semibold text-blue-700">
                {m.name}
              </div>

              <div className="text-sm">
                Match Score:{" "}
                <span className="font-bold text-green-600">
                  {m.score}%
                </span>
              </div>

              <div className="text-xs text-gray-600">
                {m.description}
              </div>

              {m.strengths && m.strengths.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium text-green-700">
                    Strengths
                  </div>
                  <ul className="text-xs text-green-700 list-disc ml-4">
                    {m.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {m.risks && m.risks.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium text-red-700">
                    Risks
                  </div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {m.risks.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {m.requirements && m.requirements.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium text-blue-700">
                    Requirements
                  </div>
                  <ul className="text-xs text-blue-700 list-disc ml-4">
                    {m.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
