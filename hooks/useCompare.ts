"use client";

import { useEffect, useState } from "react";

export function useCompare(grantIds: string[]) {
  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const res = await fetch("/api/compare", {
      method: "POST",
      body: JSON.stringify({ grantIds }),
    });

    const data = await res.json();

    if (res.ok) {
      setGrants(data.grants || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (grantIds.length > 0) {
      load();
    }
  }, [grantIds]);

  return { grants, loading };
}
