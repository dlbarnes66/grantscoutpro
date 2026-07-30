"use client";

import { useState } from "react";

export default function SectionReview({
  workspaceId,
  grantId,
  sectionId
}: {
  workspaceId: string;
  grantId: string;
  sectionId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<any>(null);

  async function runReview() {
    setLoading(true);

    const res = await fetch("/api/grants/review", {
      method: "POST",
      body: JSON.stringify({ sectionId }),
    });

    const data = await res.json();
    setReview(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6 p-4 border rounded-md bg-white shadow-sm">
      <button
        onClick={runReview}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {loading ? "Reviewing..." : "Run AI Review"}
      </button>

      {review && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Reviewer Summary</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {review.summary}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Scores</h2>
            <ul className="list-disc ml-6">
              <li>Clarity: {review.score.clarity}/100</li>
              <li>Alignment: {review.score.alignment}/100</li>
              <li>Completeness: {review.score.completeness}/100</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Redlines</h2>
            <ul className="list-disc ml-6">
              {review.redlines.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Recommendations</h2>
            <ul className="list-disc ml-6">
              {review.recommendations.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
