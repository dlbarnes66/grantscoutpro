"use client";

import { useState, useEffect } from "react";
import { useDocumentACL } from "@/lib/security/useDocumentACL";

export default function DocumentEditor({ workspaceId, documentId }) {
  const acl = useDocumentACL(workspaceId, documentId);

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load document content
  useEffect(() => {
    async function loadDoc() {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/editor`
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

  // Block view entirely
  if (!acl.canView) {
    return (
      <div className="p-4 text-red-600">
        You do not have permission to view this document.
      </div>
    );
  }

  async function save() {
    if (!acl.canEdit) return;

    setSaving(true);

    await fetch(
      `/api/workspaces/${workspaceId}/documents/${documentId}/editor`,
      {
        method: "POST",
        body: JSON.stringify({
          title: doc.title,
          content: doc.content,
        }),
      }
    );

    setSaving(false);
  }

  return (
    <div className="p-4">
      <input
        type="text"
        value={doc.title}
        disabled={!acl.canEdit}
        onChange={(e) => setDoc({ ...doc, title: e.target.value })}
        className={`w-full p-2 border rounded mb-4 ${
          !acl.canEdit ? "bg-gray-200 cursor-not-allowed" : ""
        }`}
      />

      <textarea
        value={doc.content}
        disabled={!acl.canEdit}
        onChange={(e) => setDoc({ ...doc, content: e.target.value })}
        className={`w-full h-96 p-2 border rounded ${
          !acl.canEdit ? "bg-gray-200 cursor-not-allowed" : ""
        }`}
      />

      <button
        onClick={save}
        disabled={!acl.canEdit || saving}
        className={`mt-4 px-4 py-2 rounded text-white ${
          acl.canEdit
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {saving ? "Saving..." : "Save"}
      </button>

      {!acl.canEdit && (
        <div className="mt-3 text-yellow-600">
          You can view this document but cannot edit it.
        </div>
      )}
    </div>
  );
}
