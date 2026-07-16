"use client";

import { useEffect, useState } from "react";

export function useSavedGrants() {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const res = await fetch("/api/saved-grants");
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
