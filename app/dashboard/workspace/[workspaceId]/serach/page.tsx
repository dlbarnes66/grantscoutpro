"use client";

import { useState } from "react";
import GrantSearchCard from "./GrantSearchCard";

export default function GrantSearchPage({
  params
}: {
  params: { workspaceId: string };
}) {
  const workspaceId = params.workspaceId;

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  async function runSearch() {
    setLoading(true);

    const res = await fetch("/api/grants/search", {
      method: "POST",
      body: JSON.stringify({ query, workspaceId }),
    });

    const data = await res.json();
    setResults(data.results || []);
    setLoading(false);
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Grant Search</h1>

      <input
        type="text"
        className="w-full p-3 border rounded-md"
        placeholder="Search for grants (e.g., 'youth programs', 'STEM', 'community development')"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button
        onClick={runSearch}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {loading ? "Searching..." : "Search Grants"}
      </button>

      <div className="space-y-4">
        {results.map((grant, i) => (
          <GrantSearchCard key={i} grant={grant} />
        ))}
      </div>
    </div>
  );
}
