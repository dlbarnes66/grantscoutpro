"use client";

import { useState, useCallback } from "react";

export interface SemanticSearchResult {
  documentId: string;
  documentName: string;
  updatedAt: string;
  snippet: string;
  score: number;
}

export function useSemanticSearch(workspaceId: string) {
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (query: string) => {
      if (!workspaceId || !query.trim()) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/workspaces/${workspaceId}/search/query`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "Search failed.");
          setResults([]);
          return;
        }
        setResults(data.results || []);
      } catch (err) {
        console.error("Semantic search error:", err);
        setError("Search failed.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [workspaceId]
  );

  return { results, loading, error, search };
}
