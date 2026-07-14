"use client";

import { useState } from "react";
import GrantAIButton from "@/components/grants/GrantAIButton";

export default function GrantComparisonPanel({ workspaceId, grantIds }) {
  const [result, setResult] = useState(null);

  async function compare() {
    const res = await fetch(
      `/api/workspaces/${workspaceId}/grants/compare`,
      {
        method: "POST",
        body: JSON.stringify({ grantIds }),
      }
    );

    const data = await res.json();
    setResult(data);
  }

  return (
    <div className="p-4 border rounded bg-white shadow space-y-4">
      <h2 className="text-xl font-bold">Grant Comparison</h2>

      <button
        onClick={compare}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Compare Grants
      </button>

      {result && (
        <div className="space-y-4">
          {result.compared.map(g => (
            <div key={g.id} className="border p-3 rounded bg-gray-50">
              <div className="font-semibold">{g.title}</div>
              <div className="text-sm text-gray-600">
                {g.agency} — Deadline: {g.deadline}
              </div>
              <div className="mt-2">Score: {g.score.toFixed(1)}</div>
            </div>
          ))}

          {result.ignored.length > 0 && (
            <div className="text-red-600">
              You did not have permission to view: {result.ignored.join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
