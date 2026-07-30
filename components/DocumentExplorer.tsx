"use client";

import { useDocuments } from "@/hooks/useDocuments";
import { FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface DocumentItem {
  id: string;
  title?: string;
  summary?: string;
  updatedAt?: string;
}

interface UseDocumentsResult {
  documents: DocumentItem[] | null;
  loading: boolean;
  error: string | null;
}

export default function DocumentExplorer() {
  const { documents, loading, error } = useDocuments() as UseDocumentsResult;

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-xl shadow-sm border flex items-center gap-2 text-gray-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading workspace documents…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="p-4 bg-white rounded-xl shadow-sm border text-sm text-gray-500">
        No documents found in this workspace yet.
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">
        Workspace Documents
      </h2>

      <div className="space-y-2">
        {documents.map((doc) => (
          <Link
            key={doc.id}
            href={`/documents/${doc.id}`}
            className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition"
          >
            <FileText className="w-4 h-4 text-gray-400 mt-1" />

            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {doc.title || "Untitled Document"}
              </div>

              {doc.summary && (
                <div className="text-xs text-gray-600 line-clamp-2">
                  {doc.summary}
                </div>
              )}

              {doc.updatedAt && (
                <div className="text-xs text-gray-400 mt-1">
                  Updated: {new Date(doc.updatedAt).toLocaleString()}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
