"use client";

import { useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;

    setLoading(true);

    const response = await fetch("/api/search", {
      method: "POST",
      body: JSON.stringify({
        workspaceId: "YOUR_WORKSPACE_ID", // Replace with actual workspace ID
        query,
      }),
    });

    const data = await response.json();
    setResults(data.results || []);
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Semantic Search</h1>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search your documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border rounded px-4 py-2"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-gray-500">Searching...</p>}

      <div className="space-y-4">
        {results.map((result) => (
          <div
            key={result.id}
            className="border rounded p-4 bg-white shadow-sm"
          >
            <p className="text-sm text-gray-500">
              Document ID: {result.documentId}
            </p>

            <p className="mt-2">{result.content}</p>

            <p className="mt-2 text-xs text-gray-400">
              Similarity Score: {result.distance.toFixed(4)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
