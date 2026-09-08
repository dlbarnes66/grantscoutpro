"use client"

import { useEffect, useState } from "react";

export default function EmbeddingsPanel({ workspaceId, documentId, userId }) {
  const [embeddings, setEmbeddings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchEmbeddings() {
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/embeddings`
      );
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }
      const data = await res.json();
      setEmbeddings(data.embeddings || null);
    } catch (err) {
      console.error("Failed to fetch embeddings:", err);
    } finally {
      setLoading(false);
    }
  }

  async function refreshEmbeddings() {
    setRefreshing(true);

    try {
      await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/embeddings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        }
      );

      fetchEmbeddings();
    } catch (err) {
      console.error("Failed to refresh embeddings:", err);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchEmbeddings();
  }, []);

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Embeddings</h2>

      <button
        onClick={refreshEmbeddings}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {refreshing ? "Refreshing..." : "Refresh Embeddings"}
      </button>

      {loading ? (
        <div className="text-gray-500">Loading embeddings...</div>
      ) : !embeddings ? (
        <div className="text-gray-500">No embeddings found.</div>
      ) : (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-gray-50 space-y-2">
            <div className="text-sm font-medium">Embedding Vector</div>

            <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
              {JSON.stringify(embeddings.vector || [], null, 2)}
            </pre>
          </div>

          <div className="border rounded-md p-3 bg-gray-50 space-y-2">
            <div className="text-sm font-medium">Metadata</div>

            <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
              {JSON.stringify(embeddings.meta || {}, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
