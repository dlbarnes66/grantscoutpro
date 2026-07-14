"use client";

import { useState } from "react";

export default function RecoveryToolsPanel() {
  const [message, setMessage] = useState("");

  async function run(action, payload) {
    const res = await fetch("/api/superadmin/recovery", {
      method: "POST",
      body: JSON.stringify({ action, payload }),
    });

    const json = await res.json();
    setMessage(JSON.stringify(json, null, 2));
  }

  return (
    <div className="p-6 border rounded bg-blue-50 shadow space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">Recovery Tools</h2>

      <div className="space-y-4">

        <button
          onClick={() =>
            run("restoreGrant", {
              grantId: prompt("Grant ID to restore?")
            })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Restore Deleted Grant
        </button>

        <button
          onClick={() =>
            run("restoreDocument", {
              documentId: prompt("Document ID to restore?")
            })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Restore Deleted Document
        </button>

        <button
          onClick={() =>
            run("restoreGrantSnapshot", {
              snapshotId: prompt("Grant Snapshot ID?")
            })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Restore Grant Snapshot
        </button>

        <button
          onClick={() =>
            run("restoreDocumentVersion", {
              versionId: prompt("Document Version ID?")
            })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Restore Document Version
        </button>

        <button
          onClick={() =>
            run("rebuildGrantAccess", {
              grantId: prompt("Grant ID?")
            })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Rebuild Grant Access
        </button>

        <button
          onClick={() =>
            run("rebuildDocumentAccess", {
              documentId: prompt("Document ID?")
            })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Rebuild Document Access
        </button>

      </div>

      {message && (
        <pre className="p-4 bg-white border rounded shadow text-sm overflow-auto">
          {message}
        </pre>
      )}
    </div>
  );
}
