"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RelatedDocumentsPanel({
  workspaceId,
  documentId,
}: {
  workspaceId: string;
  documentId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<
    { documentId: string; content: string; score: number }[]
  >([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await fetch(`/api/documents/${documentId}/matches`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load related documents");
          setLoading(false);
          return;
        }

        setMatches(data.matches || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Unexpected error loading related documents");
        setLoading(false);
      }
    }

    loadMatches();
  }, [workspaceId, documentId]);

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm mt-6">
      <h2 className="text-xl font-semibold mb-3 text-blue-700">
        Related Documents
      </h2>

      {loading && (
        <div className="space-y-3">
          <div className="animate-pulse bg-gray-200 h-4 rounded w-2/3" />
          <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4" />
          <div className="animate-pulse bg-gray-200 h-4 rounded w-1/2" />
        </div>
      )}

      {error && <div className="text-red-600">{error}</div>}

      {!loading && matches.length === 0 && !error && (
        <div className="text-gray-500">No related documents found.</div>
      )}

      <div className="space-y-4">
        {matches.map((m) => (
          <div key={m.documentId} className="border rounded p-3 bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">
              Similarity: {(m.score * 100).toFixed(1)}%
            </div>

            <div className="text-gray-800 mb-3 whitespace-pre-wrap">
              {m.content}
            </div>

            <button
              onClick={() =>
                router.push(
                  `/workspace/${workspaceId}/documents/${m.documentId}`
                )
              }
              className="text-blue-600 hover:underline"
            >
              Open Document →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
