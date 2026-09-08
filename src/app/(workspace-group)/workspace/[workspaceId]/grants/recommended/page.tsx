"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function RecommendedGrantsPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/grants/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Failed to load recommendations (${res.status}).`);
      }

      setResults(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Recommended Grants</h1>

      <button
        onClick={loadRecommendations}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Loading..." : "Load Recommendations"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {results && results.length === 0 && !error && (
        <p className="text-sm text-gray-500">No recommendations yet.</p>
      )}

      {results && results.length > 0 && (
        <div className="space-y-4">
          {results.map((grant) => (
            <div key={grant.id} className="border p-4 rounded">
              <h2 className="text-lg font-semibold">{grant.title}</h2>
              <p className="text-sm text-gray-600">{grant.agency}</p>

              <div className="mt-2 text-sm">
                <strong>Score:</strong> {grant.score ?? "N/A"}
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Eligible States: {grant.eligibleStates || "N/A"}
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Geographic Focus: {grant.geographicFocus || "N/A"}
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
