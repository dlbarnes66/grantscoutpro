"use client";

import { useState } from "react";

export default function MultiReviewerPanel({
  workspaceId,
  documentId,
  userId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [reviewers, setReviewers] = useState(null);

  async function runMultiReview() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/reviewers`,
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
      setReviewers(data.reviewers || null);
    } catch (err) {
      console.error("Multi‑reviewer simulation failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Multi‑Reviewer Simulation</h2>

      <button
        onClick={runMultiReview}
        className="mb-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
      >
        {loading ? "Simulating…" : "Run Multi‑Reviewer Simulation"}
      </button>

      {!reviewers && !loading && (
        <div className="text-gray-500">No reviewer feedback yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI simulating multiple reviewers…</div>
      )}

      {reviewers && (
        <div className="space-y-4 overflow-y-auto flex-1">
          {reviewers.map((rev, i) => (
            <div
              key={i}
              className="border rounded-md p-3 bg-gray-50 space-y-2"
            >
              <div className="text-lg font-semibold text-orange-700">
                {rev.name}
              </div>

              <div className="text-sm">
                Score:{" "}
                <span className="font-bold text-orange-600">
                  {rev.score}/100
                </span>
              </div>

              <div className="text-xs text-gray-700">
                {rev.feedback}
              </div>

              {rev.strengths && rev.strengths.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium text-green-700">
                    Strengths
                  </div>
                  <ul className="text-xs text-green-700 list-disc ml-4">
                    {rev.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {rev.weaknesses && rev.weaknesses.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium text-red-700">
                    Weaknesses
                  </div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {rev.weaknesses.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {rev.recommendations && rev.recommendations.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium text-blue-700">
                    Recommendations
                  </div>
                  <ul className="text-xs text-blue-700 list-disc ml-4">
                    {rev.recommendations.map((r, idx) => (
                      <li key={idx}>{r}</li>
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
