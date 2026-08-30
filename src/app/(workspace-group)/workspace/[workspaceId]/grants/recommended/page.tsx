"use client"

import { useState } from "react";

export default function RecommendedGrantsPage({ params }) {
  const workspaceId = params.workspaceId;

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadRecommendations = async () => {
    setLoading(true);

    const res = await fetch("/api/grants/recommendations", {
      method: "POST",
      body: JSON.stringify({ workspaceId }),
    });

    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Recommended Grants</h1>

      <button
        onClick={loadRecommendations}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Load Recommendations
      </button>

      {loading && <div>Loading recommendations…</div>}

      {results && (
        <div className="space-y-4">
          {results.map((grant) => (
            <div key={grant.id} className="border p-4 rounded">
              <h2 className="text-lg font-semibold">{grant.title}</h2>
              <p className="text-sm text-gray-600">{grant.agency}</p>

              <div className="mt-2 text-sm">
                <strong>Score:</strong> {grant.score}
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Eligible States: {grant.eligibleStates}
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Geographic Focus: {grant.geographicFocus}
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Deadline: {grant.deadline || "N/A"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
