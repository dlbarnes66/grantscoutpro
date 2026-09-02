"use client"

import { useState } from "react";

export default function GrantReadabilityOptimizerPanel({
  workspaceId,
  documentId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [readability, setReadability] = useState(null);

  async function optimize() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/readability`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content })
        }
      );

      const data = await res.json();
      setReadability(data.readability || null);
    } catch (err) {
      console.error("Readability optimization failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">AI Readability Optimizer</h2>

      <button
        onClick={optimize}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {loading ? "Optimizing…" : "Improve Readability"}
      </button>

      {!readability && !loading && (
        <div className="text-gray-500">No readability report yet.</div>
      )}

      {loading && <div className="text-gray-500">AI rewriting text…</div>}

      {readability && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border p-3 rounded bg-blue-50">
            <div className="text-sm font-medium">Improved Text</div>
            <div className="text-sm text-gray-800 whitespace-pre-wrap">
              {readability.improvedText}
            </div>
          </div>

          {Array.isArray(readability.notes) &&
            readability.notes.length > 0 && (
              <div className="border p-3 rounded bg-green-50">
                <div className="text-sm font-medium text-green-700">
                  Notes
                </div>
                <ul className="text-xs text-green-700 list-disc ml-4">
                  {readability.notes.map((n, idx) => (
                    <li key={idx}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
