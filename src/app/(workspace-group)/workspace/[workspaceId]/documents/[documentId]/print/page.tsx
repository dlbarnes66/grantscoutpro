"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Printer, Download, ArrowLeft } from "lucide-react";

// A dedicated, chrome-free view of one document, meant for
// window.print() (browser "Print" / "Save as PDF") - separate from the
// main Grant Intelligence Dashboard page so printing doesn't also print
// the AI-panel sidebar/UI. Real server-generated PDF download (via
// pdf-lib) lives at .../documents/[documentId]/pdf and is offered here
// too, so both export paths are one click away from the same screen.
export default function DocumentPrintPage() {
  const params = useParams() as { workspaceId: string; documentId: string };
  const router = useRouter();
  const { workspaceId, documentId } = params;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/documents/${documentId}/viewer`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load document");
        if (!cancelled) {
          setTitle(data.title || "Untitled Document");
          setContent(data.content || "");
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load document");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (workspaceId && documentId) load();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, documentId]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
        }
      `}</style>

      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <button
          onClick={() => router.push(`/workspace/${workspaceId}/documents/${documentId}`)}
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={15} /> Back to document
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            <Printer size={14} /> Print
          </button>
          <a
            href={`/api/workspaces/${workspaceId}/documents/${documentId}/pdf`}
            className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download size={14} /> Download PDF
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-8 py-10">
        {loading && (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 size={16} className="animate-spin" /> Loading document...
          </div>
        )}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <>
            <h1 className="mb-6 text-3xl font-bold">{title}</h1>
            <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800">
              {content || "(This document is empty.)"}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
