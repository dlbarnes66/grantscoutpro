"use client";

import { useEffect, useState } from "react";

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const res = await fetch("/api/recommendations");
    const data = await res.json();

    if (res.ok) {
      setRecommendations(data.recommendations || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return { recommendations, loading };
}
