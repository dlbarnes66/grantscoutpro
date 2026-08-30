"use client"

import { useState } from "react";
import { useGrantACL } from "@/lib/security/useGrantACL";
import { GrantACL, GrantIntelligenceResult } from "./types";

export default function GrantIntelligencePanel({
  workspaceId,
  grantId
}: {
  workspaceId: string;
  grantId: string;
}) {
  const acl: GrantACL = useGrantACL(workspaceId, grantId);

  const [mode, setMode] = useState<string>("eligibility");
  const [result, setResult] = useState<GrantIntelligenceResult | null>(null);

  if (acl.loading) {
    return <div className="p-4">Loading permissions…</div>;
  }

  if (!acl.canRunDocumentAI) {
    return null;
  }

  async function runIntelligence() {
    const res = await fetch(
      `/api/workspaces/${workspaceId}/grants/${grantId}/intelligence`,
      {
        method: "POST",
        body: JSON.stringify({ mode })
      }
    );

    const data: GrantIntelligenceResult = await res.json();
    setResult(data);
  }

  return (
    <div className="p-4 border rounded bg-white shadow space-y-4">
      <h2 className="text-xl font-bold">Grant Intelligence</h2>

      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="eligibility">Eligibility Score</option>
        <option value="compliance">Compliance Score</option>
        <option value="risk">Risk Score</option>
        <option value="fit">Fit Score</option>
      </select>

      <button
        onClick={runIntelligence}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Run Intelligence
      </button>

      {result && (
        <div className="border p-3 rounded bg-gray-50 whitespace-pre-wrap">
          <div className="font-semibold">Score: {result.score.toFixed(1)}</div>
          <div className="text-sm text-gray-700 mt-2">{result.notes}</div>
        </div>
      )}
    </div>
  );
}
