"use client";

import { useEffect, useState } from "react";

export default function SnapshotsPanel({ workspaceId, documentId, userId }) {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchSnapshots() {
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/snapshots`
      );
      const data = await res.json();
      setSnapshots(data.snapshots || []);
    } catch (err) {
      console.error("Failed to fetch snapshots:", err);
    } finally {
      setLoading(false);
    }
  }

  async function createSnapshot() {
    try {
      await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/snapshots`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        }
      );

      fetchSnapshots();
    } catch (err) {
      console.error("Failed to create snapshot:", err);
    }
  }

  async function restoreSnapshot(snapshotId) {
    try {
      await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/snapshots`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ snapshotId })
        }
      );

      fetchSnapshots();
    } catch (err) {
      console.error("Failed to restore snapshot:", err);
    }
  }

  useEffect(() => {
    fetchSnapshots();
  }, []);

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Snapshots</h2>

      <button
        onClick={createSnapshot}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Create Snapshot
      </button>

      {loading ? (
        <div className="text-gray-500">Loading snapshots...</div>
      ) : snapshots.length === 0 ? (
        <div className="text-gray-500">No snapshots yet.</div>
      ) : (
        <div className="space-y-4 overflow-y-auto flex-1">
          {snapshots.map((s) => (
            <div
              key={s.id}
              className="border rounded-md p-3 bg-gray-50 space-y-2"
            >
              <div className="text-sm font-medium">
                Snapshot {s.id.slice(0, 8)}
              </div>

              <div className="text-xs text-gray-500">
                {new Date(s.createdAt).toLocaleString()}
              </div>

              <button
                onClick={() => restoreSnapshot(s.id)}
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
