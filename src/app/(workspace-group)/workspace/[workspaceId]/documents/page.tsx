"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

interface WorkspaceDocument {
  id: string;
  title: string;
  updatedAt: string;
  sizeBytes: number | null;
}

export default function DocumentsListPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/documents/list`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.error || "Failed to load documents");
        }

        if (!cancelled) {
          setDocuments(json.documents || []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to load documents");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (workspaceId) load();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  return (
    <WorkspaceShell title="Documents" workspaceId={workspaceId}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Documents</h1>

          <Link
            href={`/workspace/${workspaceId}/documents/new`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + New Document
          </Link>
        </div>

        {loading && <p className="text-slate-400">Loading documents...</p>}

        {error && (
          <p className="text-red-400">
            Couldn&apos;t load documents: {error}
          </p>
        )}

        {!loading && !error && documents.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-slate-400 mb-4">
              No documents yet for this workspace.
            </p>
            <Link
              href={`/workspace/${workspaceId}/documents/new`}
              className="text-[#00E5FF] hover:underline"
            >
              Create your first document
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/workspace/${workspaceId}/documents/${doc.id}`}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-[#00E5FF] transition"
            >
              <p className="text-lg font-semibold">{doc.title}</p>
              <p className="text-sm text-slate-400 mt-2">
                Updated {new Date(doc.updatedAt).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
}
