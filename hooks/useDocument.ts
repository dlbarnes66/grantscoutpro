"use client";

import { useEffect, useState } from "react";

export function useDocument(id: string) {
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const res = await fetch(`/api/documents/${id}`);
    const data = await res.json();

    if (res.ok) {
      setDoc(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (id) load();
  }, [id]);

  return { doc, loading };
}
