"use client";

import { useState, useEffect } from "react";
import { useDocumentACL } from "@/lib/security/useDocumentACL";

interface DocumentData {
  title: string;
  content: string;
  updatedAt: string;
}

export default function DocumentViewer({
  workspaceId,
  documentId,
}: {
  workspaceId: string;
  documentId: string;
}) {
  const acl = useDocumentACL(workspaceId, documentId);

  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDoc() {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/viewer`
      );
      const data = await res.json();
      setDoc(data);
      setLoading(false);
    }

    loadDoc();
  }, [workspaceId, documentId]);

  if (acl.loading || loading) {
    return <div className="p-4">Loading document...</div>;
  }

  if (!acl.canView) {
    return (
      <div className="p-4 text-red-600">
        You do not have permission to view this document.
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="p-4 text-red-600">
        Document could not be loaded.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{doc.title}</h1>

      <div className="border p-4 rounded bg-gray-50 whitespace-pre-wrap">
        {doc.content}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Last updated: {new Date(doc.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}
