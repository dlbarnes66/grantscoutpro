"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { WorkspaceRepairResponse } from "./types";

export default function WorkspaceRepairConsole() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runRepair() {
    const workspaceId = prompt("Workspace ID?");

    if (!workspaceId) {
      setResult("No workspace ID provided.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/superadmin/workspace-repair", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workspaceId }),
      });

      if (!res.ok) {
        setResult(`Error: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }

      const data: WorkspaceRepairResponse = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult("Error running repair");
    }

    setLoading(false);
  }

  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-semibold">Workspace Repair Console</h2>

      <Button onClick={runRepair} disabled={loading}>
        {loading ? "Running..." : "Run Repair"}
      </Button>

      {result && (
        <pre className="bg-slate-800 p-4 rounded text-sm text-slate-200 overflow-auto whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </Card>
  );
}
