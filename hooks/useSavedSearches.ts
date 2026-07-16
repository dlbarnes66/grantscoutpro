"use client";

import { useEffect, useState } from "react";

export function useSavedSearches() {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const res = await fetch("/api/saved-searches");
    const data = await res.json();

    if (res.ok) {
      setSaved(data.saved);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return { saved, loading };
}
