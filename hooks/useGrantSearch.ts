"use client";

import { useState } from "react";

export function useGrantSearch() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function search(query: string) {
    setLoading(true);

    const res = await fetch("/api/search", {
      method: "POST",
      body: JSON.stringify({ query }),
    });

    const data = await res.json();

    if (res.ok) {
      setResults(data.results || []);
    }

    setLoading(false);
  }

  return { results, loading, search };
}
