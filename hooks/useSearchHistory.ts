"use client";

import { useEffect, useState } from "react";

export function useSearchHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const res = await fetch("/api/search-history");
    const data = await res.json();

    if (res.ok) {
      setHistory(data.history);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return { history, loading };
}
