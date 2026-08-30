"use client"

import { useState } from "react";

export default function WorkspaceRepairConsole() {
  const [output, setOutput] = useState("");

  async function runRepair(action: string, payload: Record<string, any>) {
    const res = await fetch("/api/superadmin/workspace-repair", {
      method: "POST",
      body: JSON.stringify({ action, payload }),
    });

    const data = await res.json();
    setOutput(JSON.stringify(data, null, 2));
  }

  return (
    <div className="p-6 border rounded bg-blue-50 shadow space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">Workspace Repair Console</h2>

      <div className="space-y-4">
        <button
          onClick={() =>
            runRepair("repairWorkspace", {
              workspaceId: prompt("Workspace ID?"),
            })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Repair Workspace
        </button>

        <button
          onClick={() =>
            runRepair("fixMembers", {
              workspaceId: prompt("Workspace ID?"),
            })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Fix Workspace Members
        </button>

        <button
          onClick={() =>
            runRepair("syncBilling", {
              workspaceId: prompt("Workspace ID?"),
            })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Sync Billing
        </button>
      </div>

      {output && (
        <pre className="p-4 bg-white border rounded shadow text-sm overflow-auto">
          {output}
        </pre>
      )}
    </div>
  );
}
