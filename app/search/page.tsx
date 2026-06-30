"use client";

import { useState } from "react";
import { SearchBar } from "@/components/search/SearchBar";
import { FiltersPanel } from "@/components/search/FiltersPanel";
import { GrantResults } from "@/components/search/GrantResults";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function runSearch() {
    setLoading(true);

    // Placeholder — real API integration comes in Batch 4XX
    await new Promise((r) => setTimeout(r, 800));

    setResults([
      {
        id: "1",
        title: "Youth Empowerment Grant",
        funder: "Community Impact Foundation",
        amount: 50000,
        deadline: "2026-09-15",
        matchScore: 87
      },
      {
        id: "2",
        title: "STEM Innovation Fund",
        funder: "National Science Alliance",
        amount: 120000,
        deadline: "2026-10-01",
        matchScore: 92
      }
    ]);

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-100">
        Grant Search
      </h1>

      <SearchBar
        query={query}
        onChange={setQuery}
        onSearch={runSearch}
      />

      <FiltersPanel filters={filters} onChange={setFilters} />

      <GrantResults results={results} loading={loading} />
    </div>
  );
}
