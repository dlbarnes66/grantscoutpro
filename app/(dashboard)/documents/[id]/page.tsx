"use client";

import { useState, useEffect } from "react";

type DocumentPageProps = {
  params: {
    id: string;
  };
};

export default function DocumentPage({ params }: DocumentPageProps) {
  const [query, setQuery] = useState("");
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [documentContent, setDocumentContent] = useState<string>("");

  useEffect(() => {
    async function loadDocument() {
      try {
        const res = await fetch(`/api/documents/${params.id}`);
        const data = await res.json();
        setDocumentContent(data.content || data.text || "");
      } catch (err) {
        console.error("Failed to load document:", err);
      }
    }

    loadDocument();
  }, [params.id]);

  async function generateSummary() {
    try {
      setLoadingSummary(true);

      const response = await fetch(`/api/documents/${params.id}/summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        console.error("Summary API returned an error:", response.status);
        setSummary("Unable to generate summary.");
        return;
      }

      const data = await response.json();

      if (data && typeof data.summary === "string") {
        setSummary(data.summary);
      } else {
        setSummary("No summary was generated.");
      }
    } catch (error) {
      console.error("Summary generation failed:", error);
      setSummary("An unexpected error occurred while generating the summary.");
    } finally {
      setLoadingSummary(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Document</h1>

      <div className="border rounded p-3 bg-white">
        <h2 className="text-lg font-semibold mb-2">Content</h2>
        <div className="whitespace-pre-wrap text-sm">
          {documentContent || "No content available."}
        </div>
      </div>

      <div className="border rounded p-3 bg-white space-y-3">
        <h2 className="text-lg font-semibold">AI Summary</h2>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Optional: guide the summary (e.g. 'focus on eligibility')"
          className="border rounded px-2 py-1 w-full text-sm mb-2"
        />

        <button
          onClick={generateSummary}
          className="px-4 py-2 bg-blue-700 text-white rounded text-sm"
        >
          {loadingSummary ? "Generating…" : "Generate Summary"}
        </button>

        <div className="mt-3 text-sm whitespace-pre-wrap">
          {summary || "No summary yet."}
        </div>
      </div>
    </div>
  );
}
