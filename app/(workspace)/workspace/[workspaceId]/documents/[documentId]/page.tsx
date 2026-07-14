"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* Presence */
function usePresence(workspaceId, documentId, userId) {
  const [presence, setPresence] = useState([]);

  async function updatePresence() {
    try {
      await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/presence`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        }
      );
    } catch (err) {}
  }

  async function fetchPresence() {
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/presence`
      );
      const data = await res.json();
      setPresence(data.presence || []);
    } catch (err) {}
  }

  useEffect(() => {
    updatePresence();
    fetchPresence();

    const interval = setInterval(() => {
      updatePresence();
      fetchPresence();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return presence;
}

function PresenceBar({ presence }) {
  if (!presence || presence.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No one else is viewing this document.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {presence.map((p) => (
        <div
          key={p.userId}
          className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm text-gray-700">
            User {p.userId} active
          </span>
        </div>
      ))}
    </div>
  );
}

/* Comments */
import CommentsPanel from "./CommentsPanel";

/* Messages */
import MessagesPanel from "./MessagesPanel";

/* Versions */
import VersionsPanel from "./VersionsPanel";

/* Snapshots */
import SnapshotsPanel from "./SnapshotsPanel";

/* Patches */
import PatchesPanel from "./PatchesPanel";

/* Files */
import FilesPanel from "./FilesPanel";

/* Embeddings */
import EmbeddingsPanel from "./EmbeddingsPanel";

export default function DocumentEditorPage({ params }) {
  const router = useRouter();
  const { workspaceId, documentId } = params;

  const [document, setDocument] = useState(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const userId = "system";

  const presence = usePresence(workspaceId, documentId, userId);

  const [showComments, setShowComments] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [showPatches, setShowPatches] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showEmbeddings, setShowEmbeddings] = useState(false);

  async function fetchDocument() {
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}`
      );
      const data = await res.json();
      setDocument(data.document);
      setTitle(data.document.title || "");
      setContent(JSON.stringify(data.document.content || {}, null, 2));
    } catch (err) {}
  }

  async function saveDocument() {
    setSaving(true);

    try {
      await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content: JSON.parse(content)
          })
        }
      );
    } catch (err) {}

    setSaving(false);
  }

  useEffect(() => {
    fetchDocument();
  }, []);

  return (
    <div className="flex">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveDocument}
            className="text-2xl font-semibold border-b border-gray-300 focus:outline-none w-full"
          />

          <div className="text-gray-500 text-sm">
            {saving ? "Saving..." : "Saved"}
          </div>
        </div>

        <PresenceBar presence={presence} />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={saveDocument}
          className="w-full h-[600px] border rounded-md p-4 font-mono text-sm"
        />

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => setShowComments(true)}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Comments
          </button>

          <button
            onClick={() => setShowMessages(true)}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Messages
          </button>

          <button
            onClick={() => setShowVersions(true)}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Versions
          </button>

          <button
            onClick={() => setShowSnapshots(true)}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Snapshots
          </button>

          <button
            onClick={() => setShowPatches(true)}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Patches
          </button>

          <button
            onClick={() => setShowFiles(true)}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Files
          </button>

          <button
            onClick={() => setShowEmbeddings(true)}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Embeddings
          </button>
        </div>
      </div>

      {showComments && (
        <CommentsPanel
          workspaceId={workspaceId}
          documentId={documentId}
          userId={userId}
        />
      )}

      {showMessages && (
        <MessagesPanel
          workspaceId={workspaceId}
          documentId={documentId}
          userId={userId}
        />
      )}

      {showVersions && (
        <VersionsPanel
          workspaceId={workspaceId}
          documentId={documentId}
          userId={userId}
        />
      )}

      {showSnapshots && (
        <SnapshotsPanel
          workspaceId={workspaceId}
          documentId={documentId}
          userId={userId}
        />
      )}

      {showPatches && (
        <PatchesPanel
          workspaceId={workspaceId}
          documentId={documentId}
          userId={userId}
        />
      )}

      {showFiles && (
        <FilesPanel
          workspaceId={workspaceId}
          documentId={documentId}
          userId={userId}
        />
      )}

      {showEmbeddings && (
        <EmbeddingsPanel
          workspaceId={workspaceId}
          documentId={documentId}
          userId={userId}
        />
      )}
    </div>
  );
}
