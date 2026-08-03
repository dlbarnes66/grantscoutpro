"use client";

import { useEffect, useState } from "react";

export function useGrantSearch(initialQuery: string = "") {
  const [q, setQ] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function search(query?: string) {
    const term = query ?? q;
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/search/grants?q=${encodeURIComponent(term)}&mode=hybrid`);
    const data = await res.json();
    setResults(data.results);
    setLoading(false);
  }

  useEffect(() => {
    if (q.trim()) {
      const id = setTimeout(() => search(), 300);
      return () => clearTimeout(id);
    } else {
      setResults([]);
    }
  }, [q]);

  return { q, setQ, results, loading, search };
}
