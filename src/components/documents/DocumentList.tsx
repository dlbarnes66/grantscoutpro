"use client"

import { useEffect, useState } from "react";
import { DocumentSummary } from "./types";

export default function DocumentList({ workspaceId }: { workspaceId: string }) {
  const [docs, setDocs] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocs() {
      const res = await fetch(`/api/workspaces/${workspaceId}/documents/list`);
      const data: DocumentSummary[] = await res.json();
      setDocs(data);
      setLoading(false);
    }

    loadDocs();
  }, [workspaceId]);

  if (loading) {
    return <div className="p-4">Loading documents…</div>;
  }

  if (docs.length === 0) {
    return (
      <div className="p-4 text-gray-600">
        No documents available for your permission level.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {docs.map((doc) => (
        <a
          key={doc.id}
          href={`/workspace/${workspaceId}/documents/${doc.id}`}
          className="block p-3 border rounded hover:bg-gray-50"
        >
          <div className="font-semibold">{doc.title}</div>
          <div className="text-sm text-gray-600">
            Updated {new Date(doc.updatedAt).toLocaleString()}
          </div>
        </a>
      ))}
    </div>
  );
}
