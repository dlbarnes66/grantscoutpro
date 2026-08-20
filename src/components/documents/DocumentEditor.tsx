"use client";

import { useEffect, useState } from "react";
import DocumentAIButtons from "./DocumentAIButtons";
import DocumentVersions from "./DocumentVersions";
import { usePresence } from "@/hooks/usePresence";

export default function DocumentEditor({
  workspaceId,
  documentId,
  initialContent,
}: {
  workspaceId: string;
  documentId: string;
  initialContent: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { presence, updatePresence, leavePresence } = usePresence(
    workspaceId,
    documentId
  );

  // FIX: cleanup cannot be async
  useEffect(() => {
    updatePresence("online");

    return () => {
      // fire and forget
      leavePresence();
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      saveDocument();
    }, 3000);
    return () => clearTimeout(timeout);
  }, [content]);

  async function saveDocument() {
    try {
      setSaving(true);
      setSaveError(null);

      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error || "Failed to save document");
      }
    } catch (err: any) {
      setSaveError(err?.message ?? "Unknown save error");
    } finally {
      setSaving(false);
    }
  }

  async function reloadDocument() {
    const res = await fetch(
      `/api/workspaces/${workspaceId}/documents/${documentId}`
    );
    const data = await res.json();
    setContent(data.content ?? "");
  }

  return (
    <div className="space-y-6">

      <DocumentAIButtons
        workspaceId={workspaceId}
        documentId={documentId}
        onAIResultAction={(aiText) => {
          setContent(aiText);
          updatePresence("online");
        }}
      />

      <DocumentVersions
        workspaceId={workspaceId}
        documentId={documentId}
        onRestoreAction={reloadDocument}
      />

      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          updatePresence("online");
        }}
        className="textarea w-full h-[500px]"
      />

      <div className="text-sm text-zinc-400">
        {saving && "Saving..."}
        {saveError && <span className="text-red-400">{saveError}</span>}
      </div>

      <div className="text-xs text-zinc-400 space-y-1">
        {presence.map((p) => (
          <div key={p.userId}>
            {p.user?.name ?? "User"} — {p.status}
            <span className="text-zinc-500">
              (last seen {new Date(p.lastSeen).toLocaleTimeString()})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
