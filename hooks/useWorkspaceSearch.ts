"use client";

import { useState, useCallback } from "react";

interface SearchResult {
  id: string;
  title: string | null;
  summary: string | null;
  matchScore: number;
  content: any;
}

interface SearchResponse {
  ok: boolean;
  count: number;
  results: SearchResult[];
  cached: boolean;
}

export function useWorkspaceSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/search", {
        method: "POST",
        body: JSON.stringify({ query }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Search failed");
        setLoading(false);
        return;
      }

      const data: SearchResponse = await res.json();

      setResults(data.results || []);
      setCached(data.cached || false);
      setLoading(false);
    } catch (err) {
      console.error("Search hook error:", err);
      setError("Unexpected error during search");
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    cached,
    error,
    search,
  };
}
