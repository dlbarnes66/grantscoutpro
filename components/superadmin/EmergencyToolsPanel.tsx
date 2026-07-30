"use client";

import { useState } from "react";
import { EmergencyResponse } from "./types";

export default function EmergencyToolsPanel() {
  const [message, setMessage] = useState<string>("");

  async function run(action: string, payload: Record<string, any>) {
    const res = await fetch("/api/superadmin/emergency", {
      method: "POST",
      body: JSON.stringify({ action, payload }),
    });

    const data: EmergencyResponse = await res.json();
    setMessage(JSON.stringify(data, null, 2));
  }

  return (
    <div className="p-6 border rounded bg-red-50 shadow space-y-6">
      <h2 className="text-2xl font-bold text-red-700">Emergency Tools</h2>

      <div className="space-y-4">
        <button
          onClick={() =>
            run("repairWorkspaceOwner", {
              workspaceId: prompt("Workspace ID?"),
              newOwnerId: prompt("New Owner User ID?"),
            })
          }
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Repair Workspace Owner
        </button>

        <button
          onClick={() =>
            run("forceRemoveMember", {
              workspaceId: prompt("Workspace ID?"),
              userId: prompt("User ID to remove?"),
            })
          }
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Force Remove Member
        </button>

        <button
          onClick={() =>
            run("resetGrantAccess", {
              grantId: prompt("Grant ID?"),
            })
          }
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Reset Grant Access
        </button>

        <button
          onClick={() =>
            run("resetDocumentAccess", {
              documentId: prompt("Document ID?"),
            })
          }
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Reset Document Access
        </button>

        <button
          onClick={() =>
            run("unlockDocument", {
              documentId: prompt("Document ID?"),
            })
          }
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Unlock Document
        </button>

        <button
          onClick={() =>
            run("clearAIHistory", {
              workspaceId: prompt("Workspace ID?"),
            })
          }
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Clear AI History
        </button>

        <button
          onClick={() =>
            run("repairWorkspaceActivity", {
              workspaceId: prompt("Workspace ID?"),
            })
          }
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Repair Workspace Activity
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
