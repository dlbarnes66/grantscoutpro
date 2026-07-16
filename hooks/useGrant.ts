"use client";

import { useEffect, useState } from "react";

export function useGrant(id: string) {
  const [grant, setGrant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const res = await fetch(`/api/grants/${id}`);
    const data = await res.json();

    if (res.ok) {
      setGrant(data); // ✅ your backend returns the grant directly
    }

    setLoading(false);
  }

  useEffect(() => {
    if (id) load();
  }, [id]);

  return { grant, loading };
}
