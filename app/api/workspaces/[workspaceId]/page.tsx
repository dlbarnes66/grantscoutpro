"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function WorkspaceDashboard({ params }) {
  const { workspaceId } = params;
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    async function loadDocs() {
      const res = await fetch(`/api/workspaces/${workspaceId}/documents/list`);
      const data = await res.json();
      setDocuments(data.documents || []);
    }
    loadDocs();
  }, [workspaceId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Workspace</h1>

      <Link
        href={`/workspace/${workspaceId}/documents/new`}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Create Document
      </Link>

      <div className="mt-6 space-y-3">
        {documents.map((doc) => (
          <Link
            key={doc.id}
            href={`/workspace/${workspaceId}/documents/${doc.id}/view`}
            className="block border p-3 rounded hover:bg-gray-50"
          >
            {doc.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
