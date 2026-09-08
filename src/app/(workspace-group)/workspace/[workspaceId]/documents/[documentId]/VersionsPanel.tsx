"use client"

import { useEffect, useState } from "react";

export default function VersionsPanel({ workspaceId, documentId, userId }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchVersions() {
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/versions`
      );
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }
      const data = await res.json();
      setVersions(data.versions || []);
    } catch (err) {
      console.error("Failed to fetch versions:", err);
    } finally {
      setLoading(false);
    }
  }

  async function restoreVersion(versionId) {
    try {
      await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/versions`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ versionId })
        }
      );

      fetchVersions();
    } catch (err) {
      console.error("Failed to restore version:", err);
    }
  }

  useEffect(() => {
    fetchVersions();
  }, []);

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Version History</h2>

      {loading ? (
        <div className="text-gray-500">Loading versions...</div>
      ) : versions.length === 0 ? (
        <div className="text-gray-500">No versions yet.</div>
      ) : (
        <div className="space-y-4 overflow-y-auto flex-1">
          {versions.map((v) => (
            <div
              key={v.id}
              className="border rounded-md p-3 bg-gray-50 space-y-2"
            >
              <div className="text-sm font-medium">
                Version {v.id.slice(0, 8)}
              </div>

              <div className="text-xs text-gray-500">
                {new Date(v.createdAt).toLocaleString()}
              </div>

              <button
                onClick={() => restoreVersion(v.id)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
