"use client"

import { useState } from "react";

export default function SemanticSearchPanel({
  workspaceId,
  documentId,
}: {
  workspaceId: string;
  documentId: string;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<
    { id: string; content: string; score: number }[]
  >([]);
  const [error, setError] = useState("");

  async function runSearch() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/documents/${documentId}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Search failed");
        setLoading(false);
        return;
      }

      setResults(data.results || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Unexpected error during search");
      setLoading(false);
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-3 text-blue-700">
        Semantic Search
      </h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search this document semantically..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={runSearch}
          disabled={loading || !query.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <div className="text-red-600 mb-3">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4" />
          <div className="animate-pulse bg-gray-200 h-4 rounded w-5/6" />
          <div className="animate-pulse bg-gray-200 h-4 rounded w-2/3" />
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <div className="text-gray-500">
          No results yet. Try searching for a topic or phrase.
        </div>
      )}

      <div className="space-y-4">
        {results.map((r) => (
          <div
            key={r.id}
            className="border rounded p-3 bg-gray-50 shadow-sm"
          >
            <div className="text-sm text-gray-600 mb-2">
              Score: {(r.score * 100).toFixed(1)}%
            </div>
            <div className="text-gray-800 whitespace-pre-wrap">
              {r.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
