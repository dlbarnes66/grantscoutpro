"use client";

import { useEffect, useState } from "react";

export default function GrantDocumentsPage({ params }: any) {
  const { workspaceId, grantId } = params;

  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/grant/${grantId}/documents`);
      const data = await res.json();
      setDocs(data);
      setLoading(false);
    }
    load();
  }, [grantId]);

  if (loading) {
    return <div className="p-6 text-slate-300">Loading documents…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Documents</h1>

        <a
          href={`/dashboard/${params.workspaceId}/grant/${grantId}/documents/upload`}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          + Upload Document
        </a>
      </div>

      {docs.length === 0 ? (
        <p className="text-slate-400">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="rounded border border-slate-800 bg-slate-900/60 p-4 flex justify-between items-center"
            >
              <div>
                <div className="text-slate-100 font-semibold">{doc.filename}</div>
                <div className="text-slate-400 text-sm">
                  Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={doc.url}
                  target="_blank"
                  className="px-3 py-1 rounded bg-slate-700 text-white hover:bg-slate-600 text-sm"
                >
                  View
                </a>

                <button
                  onClick={async () => {
                    await fetch(`/api/grant/${grantId}/documents/${doc.id}`, {
                      method: "DELETE",
                    });
                    window.location.reload();
                  }}
                  className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
