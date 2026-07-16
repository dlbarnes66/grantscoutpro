"use client";

import { useDocument } from "@/hooks/useDocument";
import { FileText, Loader2, Sparkles } from "lucide-react";

export default function DocumentViewerPage({
  params,
}: {
  params: { id: string };
}) {
  const { document, loading, error } = useDocument(params.id);

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading document…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-6 text-gray-500">
        Document not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-7 h-7 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            {document.title || "Untitled Document"}
          </h1>
        </div>

        {document.updatedAt && (
          <div className="text-sm text-gray-500 mb-4">
            Last updated: {new Date(document.updatedAt).toLocaleString()}
          </div>
        )}

        {document.summary && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Summary
            </h2>
            <p className="text-blue-900">{document.summary}</p>
          </div>
        )}

        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Full Content
          </h2>

          <pre className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
            {document.content}
          </pre>
        </div>
      </div>
    </div>
  );
}
