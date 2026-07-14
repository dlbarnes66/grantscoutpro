"use client";

import { useState } from "react";

type Grant = {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  agency: string | null;
  category: string | null;
  deadline: string | null;
  source: string;
};

export default function GrantsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/grants/search", {
        method: "POST",
        body: JSON.stringify({
          query,
          filters: {},
          tier: "ENTERPRISE",
        }),
      });

      const data = await res.json();
      setResults(data.results || []);
    } catch (e: any) {
      setError(e.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Grant Search</h1>

      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Search grants by keyword, agency, category..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="space-y-3">
        {results.map((grant) => (
          <div
            key={grant.id}
            className="border rounded p-4 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">{grant.title}</h2>
              <span className="text-xs px-2 py-1 rounded bg-gray-200">
                {grant.source}
              </span>
            </div>
            {grant.agency && (
              <p className="text-sm text-gray-600">Agency: {grant.agency}</p>
            )}
            {grant.category && (
              <p className="text-sm text-gray-600">
                Category: {grant.category}
              </p>
            )}
            {grant.deadline && (
              <p className="text-sm text-gray-600">
                Deadline: {new Date(grant.deadline).toLocaleDateString()}
              </p>
            )}
            {grant.summary && (
              <p className="text-sm mt-2 line-clamp-3">{grant.summary}</p>
            )}
          </div>
        ))}

        {!loading && results.length === 0 && (
          <p className="text-sm text-gray-500">
            No results yet. Try a search above.
          </p>
        )}
      </div>
    </div>
  );
}
