"use client";

import { useState } from "react";

export default function GrantReviewerPanel({
  workspaceId,
  documentId,
  userId,
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
          body: JSON.stringify({
            userId,
            content: JSON.parse(content)
          })
        }
      );

      const data = await res.json();
      setReview(data.review || null);
    } catch (err) {
      console.error("Grant review failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">AI Grant Reviewer</h2>

      <button
        onClick={runReview}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {loading ? "Reviewing…" : "Run Grant Review"}
      </button>

      {!review && !loading && (
        <div className="text-gray-500">No review yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI analyzing your document…</div>
      )}

      {review && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="text-sm font-medium">Overall Score</div>
            <div className="text-2xl font-bold text-blue-600">
              {review.overallScore}/100
            </div>
          </div>

          {review.sections &&
            review.sections.map((section, i) => (
              <div
                key={i}
                className="border rounded-md p-3 bg-gray-50 space-y-2"
              >
                <div className="text-sm font-medium">{section.name}</div>

                <div className="text-sm">
                  Score:{" "}
                  <span className="font-semibold text-blue-600">
                    {section.score}/10
                  </span>
                </div>

                <div className="text-xs text-gray-600">
                  {section.feedback}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
