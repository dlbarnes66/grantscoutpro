"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import SnapshotsPanel from "./SnapshotsPanel";
import PatchesPanel from "./PatchesPanel";

export default function DocumentViewerPage({
  params,
}: {
  params: { workspaceId: string; documentId: string };
}) {
  const { workspaceId, documentId } = params;

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDocument() {
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load document");
      }

      setContent(data.content || "");
    } catch (err: any) {
      console.error("Failed to fetch document:", err);
      setError(err.message || "Failed to fetch document");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDocument();
  }, [workspaceId, documentId]);

  return (
    <div className="flex h-[calc(100vh-80px)]">
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Document Viewer</h1>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : error ? (
          <Card className="p-4 bg-red-50 border border-red-200">
            <p className="text-red-700 font-semibold">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </Card>
        ) : (
          <Card className="p-4">
            <Textarea value={content} readOnly className="min-h-[300px]" />
          </Card>
        )}
      </div>

      <div className="flex flex-col border-l bg-gray-50">
        <SnapshotsPanel
          workspaceId={workspaceId}
          documentId={documentId}
          userId={""}
        />
        <PatchesPanel
          workspaceId={workspaceId}
          documentId={documentId}
          userId={""}
        />
      </div>
    </div>
  );
}
