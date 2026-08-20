"use client";

import { useEffect, useState } from "react";

export default function DocumentVersions({
  workspaceId,
  documentId,
  onRestoreAction,
}: {
  workspaceId: string;
  documentId: string;
  onRestoreAction: () => void;
}) {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadVersions() {
    setLoading(true);
    const res = await fetch(
      `/api/workspaces/${workspaceId}/documents/${documentId}/version`
    );
    const data = await res.json();
    setVersions(data.versions || []);
    setLoading(false);
  }

  async function createVersion() {
    await fetch(
      `/api/workspaces/${workspaceId}/documents/${documentId}/version`,
      { method: "POST" }
    );
    loadVersions();
  }

  async function restoreVersion(versionId: string) {
    await fetch(
      `/api/workspaces/${workspaceId}/documents/${documentId}/version/${versionId}/restore`,
      { method: "POST" }
    );
    onRestoreAction();
    loadVersions();
  }

  useEffect(() => {
    loadVersions();
  }, []);

  return (
    <div className="space-y-4">
      <button onClick={createVersion} className="btn btn-secondary">
        Save Version
      </button>

      {loading && <div className="text-xs text-zinc-400">Loading versions...</div>}

      <div className="space-y-2">
        {versions.map((v) => (
          <div
            key={v.id}
            className="flex items-center justify-between border border-zinc-700 rounded px-3 py-2"
          >
            <div>
              <div className="text-sm text-white">
                Version {v.id.slice(0, 6)}
              </div>
              <div className="text-xs text-zinc-400">
                {new Date(v.createdAt).toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => restoreVersion(v.id)}
              className="btn btn-primary"
            >
              Restore
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
