"use client";

import { useParams, useRouter } from "next/navigation";
import { useDocument } from "@/hooks/useDocument";
import { FileText, Trash2 } from "lucide-react";

export default function DocumentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string; // ✅ matches your folder name

  const { doc, loading } = useDocument(documentId);

  async function deleteDoc() {
    await fetch(`/api/documents/${documentId}`, { method: "DELETE" });
    router.push("/documents");
  }

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading document…
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="p-6 text-gray-600">
        Document not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="w-7 h-7 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">
          {doc.title}
        </h1>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <div className="text-gray-500 text-sm">File Type</div>
          <div className="text-xl font-semibold mt-1">
            {doc.fileType || "Unknown"}
          </div>
        </div>

        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <div className="text-gray-500 text-sm">Text Length</div>
          <div className="text-xl font-semibold mt-1">
            {doc.textLength || "N/A"}
          </div>
        </div>

        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <div className="text-gray-500 text-sm">Created</div>
          <div className="text-xl font-semibold mt-1">
            {new Date(doc.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-white border rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Extracted Text
        </h2>
        <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
          {doc.content}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={deleteDoc}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Document
        </button>
      </div>
    </div>
  );
}
