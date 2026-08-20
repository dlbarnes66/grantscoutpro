"use client";

import { useState, useEffect } from "react";

export interface DocumentItem {
  id: string;
  title?: string;
  summary?: string;
  updatedAt?: string;
}

export function useDocumentExplorer() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // TEMP MOCK DATA — replace with API later
        const mockDocs: DocumentItem[] = [
          {
            id: "1",
            title: "Grant Proposal Draft",
            summary: "Initial draft of the proposal narrative.",
            updatedAt: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Budget Worksheet",
            summary: "Projected budget for FY2025.",
            updatedAt: new Date().toISOString(),
          },
          {
            id: "3",
            title: "Narrative Section A",
            summary: "Needs revision before submission.",
            updatedAt: new Date().toISOString(),
          },
        ];

        setDocuments(mockDocs);
      } catch (err) {
        console.error(err);
        setError("Failed to load documents.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { documents, loading, error };
}
