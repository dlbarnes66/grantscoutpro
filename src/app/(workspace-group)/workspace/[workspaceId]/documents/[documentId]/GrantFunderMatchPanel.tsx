"use client";

import { useState } from "react";

export default function GrantFunderMatchPanel({
  workspaceId,
  documentId,
  content,
  profile
}) {
  const [loading, setLoading] = useState(false);
  const [funders, setFunders] = useState(null);

  async function runMatch() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspace/${workspaceId}/documents/${documentId}/ai/funders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, profile })
        }
      );

      const data = await res.json();
      setFunders(data.funders || null);
    } catch (err) {
      console.error("Funder match failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">AI Funder Match</h2>

      <button
        onClick={runMatch}
        className="mb-4 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
      >
        {loading ? "Matching…" : "Find Funders"}
      </button>

      {!funders && !loading && (
        <div className="text-gray-500">No funder matches yet.</div>
      )}

      {loading && <div className="text-gray-500">AI matching funders…</div>}

      {funders && (
        <div className="space-y-4 overflow-y-auto flex-1">
          {Array.isArray(funders.funders) &&
            funders.funders.length > 0 &&
            funders.funders.map((f, idx) => (
              <div
                key={idx}
                className="border p-3 rounded bg-pink-50 space-y-1"
              >
                <div className="text-sm font-medium text-pink-700">
                  {f.name}
                </div>

                <div className="text-xs text-gray-700">
                  <span className="font-semibold">Match Reason:</span>{" "}
                  {f.matchReason}
                </div>

                <div className="text-xs text-pink-700">
                  <span className="font-semibold">Priority:</span>{" "}
                  {f.priority}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
