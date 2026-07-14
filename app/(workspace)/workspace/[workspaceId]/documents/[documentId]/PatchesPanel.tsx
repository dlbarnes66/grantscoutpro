"use client";

import { useEffect, useState } from "react";

export default function PatchesPanel({ workspaceId, documentId, userId }) {
  const [patches, setPatches] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchPatches() {
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/patches`
      );
      const data = await res.json();
      setPatches(data.patches || []);
    } catch (err) {
      console.error("Failed to fetch patches:", err);
    } finally {
      setLoading(false);
    }
  }

  async function restorePatch(patchId) {
    try {
      await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/patches`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patchId })
        }
      );

      fetchPatches();
    } catch (err) {
      console.error("Failed to restore patch:", err);
    }
  }

  useEffect(() => {
    fetchPatches();
  }, []);

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Patch History</h2>

      {loading ? (
        <div className="text-gray-500">Loading patches...</div>
      ) : patches.length === 0 ? (
        <div className="text-gray-500">No patches yet.</div>
      ) : (
        <div className="space-y-4 overflow-y-auto flex-1">
          {patches.map((p) => (
            <div
              key={p.id}
              className="border rounded-md p-3 bg-gray-50 space-y-2"
            >
              <div className="text-sm font-medium">
                Patch {p.id.slice(0, 8)}
              </div>

              <div className="text-xs text-gray-500">
                {new Date(p.createdAt).toLocaleString()}
              </div>

              <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                {JSON.stringify(p.diff || {}, null, 2)}
              </pre>

              <button
                onClick={() => restorePatch(p.id)}
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
