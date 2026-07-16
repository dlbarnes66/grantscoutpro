"use client";

import { useState } from "react";

interface MatchResult {
  id: string;
  title: string | null;
  summary: string | null;
  score: number;
}

export function useGrantMatching() {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function match(input: {
    organizationType: string;
    projectDescription: string;
    location?: string;
    budget?: string;
  }) {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/grants/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Grant matching failed");
        setLoading(false);
        return;
      }

      setResults(data.results || []);
      setLoading(false);
    } catch (err) {
      console.error("Grant matching hook error:", err);
      setError("Unexpected error");
      setLoading(false);
    }
  }

  return { results, loading, error, match };
}
