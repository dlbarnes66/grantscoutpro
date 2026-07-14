"use client";

import { useState } from "react";

export default function WorkspaceRepairConsole() {
  const [message, setMessage] = useState("");

  async function run(action, workspaceId, payload = {}) {
    const res = await fetch("/api/superadmin/workspace-repair", {
      method: "POST",
      body: JSON.stringify({ action, workspaceId, payload }),
    });

    const json = await res.json();
    setMessage(JSON.stringify(json, null, 2));
  }

  return (
    <div className="p-6 border rounded bg-yellow-50 shadow space-y-6">
      <h2 className="text-2xl font-bold text-yellow-700">Workspace Repair Console</h2>

      <div className="space-y-4">

        <button
          onClick={() =>
            run("fixMissingOwner", prompt("Workspace ID?"), {
              newOwnerId: prompt("New Owner User ID?")
            })
          }
          className="px-4 py-2 bg-yellow-600 text-white rounded"
        >
          Fix Missing Workspace Owner
        </button>

        <button
          onClick={() =>
            run("fixOrphanedGrants", prompt("Workspace ID?"))
          }
          className="px-4 py-2 bg-yellow-600 text-white rounded"
        >
          Fix Orphaned Grants
        </button>

        <button
          onClick={() =>
            run("fixOrphanedDocuments", prompt("Workspace ID?"))
          }
          className="px-4 py-2 bg-yellow-600 text-white rounded"
        >
          Fix Orphaned Documents
        </button>

        <button
          onClick={() =>
            run("clearStuckLocks", prompt("Workspace ID?"))
          }
          className="px-4 py-2 bg-yellow-600 text-white rounded"
        >
          Clear Stuck Document Locks
        </button>

        <button
          onClick={() =>
            run("repairActivity", prompt("Workspace ID?"))
          }
          className="px-4 py-2 bg-yellow-600 text-white rounded"
        >
          Repair Workspace Activity Logs
        </button>

        <button
          onClick={() =>
            run("repairACL", prompt("Workspace ID?"))
          }
          className="px-4 py-2 bg-yellow-600 text-white rounded"
        >
          Repair ACL Corruption
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
