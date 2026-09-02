"use client"

import { useState } from "react";

export default function GrantInlineAISuggestionsPanel({
  workspaceId,
  documentId,
  content,
  cursorContext
}) {
  const [loading, setLoading] = useState(false);
  const [inline, setInline] = useState(null);

  async function runInline() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/inline`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, cursorContext })
        }
      );

      const data = await res.json();
      setInline(data.inline || null);
    } catch (err) {
      console.error("Inline suggestions failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Inline AI Suggestions</h2>

      <button
        onClick={runInline}
        className="mb-4 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
      >
        {loading ? "Thinking…" : "Get Suggestions"}
      </button>

      {!inline && !loading && (
        <div className="text-gray-500">No inline suggestions yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI generating suggestions…</div>
      )}

      {inline && (
        <div className="space-y-4 overflow-y-auto flex-1">
          {Array.isArray(inline.suggestions) &&
            inline.suggestions.length > 0 &&
            inline.suggestions.map((s, idx) => (
              <div
                key={idx}
                className="border p-3 rounded bg-cyan-50 space-y-1"
              >
                <div className="text-sm text-gray-800">{s}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
