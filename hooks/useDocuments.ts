"use client";

import { useEffect, useState } from "react";

interface DocumentItem {
  id: string;
  title: string | null;
  summary: string | null;
  updatedAt: string | null;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/documents/list");
        const data = await res.json();

        if (!res.ok) {
          if (mounted) {
            setError(data.error || "Failed to load documents");
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setDocuments(data.documents || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("useDocuments error:", err);
        if (mounted) {
          setError("Unexpected error loading documents");
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return { documents, loading, error };
}
