"use client"

import { useState } from "react";

export default function GrantReviewerPanel({
  workspaceId,
  documentId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);

  async function runReview() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content })
        }
      );

      if (!res.ok) {

        throw new Error(`Request failed (${res.status})`);

      }

      const data = await res.json();
      setReview(data.review || null);
    } catch (err) {
      console.error("Review failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">AI Grant Reviewer</h2>

      <button
        onClick={runReview}
        className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
      >
        {loading ? "Reviewing…" : "Run Grant Review"}
      </button>

      {!review && !loading && (
        <div className="text-gray-500">No review yet.</div>
      )}

      {loading && <div className="text-gray-500">AI reviewing grant…</div>}

      {review && (
        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Summary */}
          <div className="border p-3 rounded bg-gray-50">
            <div className="text-sm font-medium">Summary</div>
            <div className="text-xs text-gray-700 whitespace-pre-wrap">
              {review.summary}
            </div>
          </div>

          {/* Strengths */}
          {Array.isArray(review.strengths) &&
            review.strengths.length > 0 && (
              <div className="border p-3 rounded bg-green-50">
                <div className="text-sm font-medium text-green-700">
                  Strengths
                </div>
                <ul className="text-xs text-green-700 list-disc ml-4">
                  {review.strengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Weaknesses */}
          {Array.isArray(review.weaknesses) &&
            review.weaknesses.length > 0 && (
              <div className="border p-3 rounded bg-red-50">
                <div className="text-sm font-medium text-red-700">
                  Weaknesses
                </div>
                <ul className="text-xs text-red-700 list-disc ml-4">
                  {review.weaknesses.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Score */}
          <div className="border p-3 rounded bg-blue-50">
            <div className="text-sm font-medium">Score</div>
            <div className="text-2xl font-bold text-blue-700">
              {review.score || "N/A"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
