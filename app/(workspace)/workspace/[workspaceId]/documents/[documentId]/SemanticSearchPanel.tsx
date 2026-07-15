"use client";

import { useState } from "react";

export default function SemanticSearchPanel() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  async function runSearch() {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/ai/semantic-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });

      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Semantic search failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-full border rounded-lg bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Semantic Search</h2>

      <input
        type="text"
        placeholder="Search your workspace..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 rounded w-full mb-3"
      />

      <button
        onClick={runSearch}
        className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-black"
      >
        {loading ? "Searching…" : "Search"}
      </button>

      <div className="space-y-3">
        {results.map((r, i) => (
          <div
            key={i}
            className="p-3 border rounded bg-gray-50"
          >
            <p className="text-sm">{r.text || r.content || "No preview available"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
