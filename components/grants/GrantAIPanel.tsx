"use client";

import { useState } from "react";
import GrantAIButton from "@/components/grants/GrantAIButton";

export default function GrantAIPanel({ workspaceId, grantId }) {
  const [result, setResult] = useState("");

  async function runAI() {
    const res = await fetch(
      `/api/workspaces/${workspaceId}/grants/${grantId}/ai`,
      {
        method: "POST",
        body: JSON.stringify({
          prompt: "Generate a grant analysis summary.",
        }),
      }
    );

    const data = await res.json();
    setResult(data.result);
  }

  return (
    <div className="p-4 border rounded bg-white shadow space-y-4">
      <h2 className="text-xl font-bold">Grant AI Analysis</h2>

      <GrantAIButton
        workspaceId={workspaceId}
        grantId={grantId}
        onClick={runAI}
      >
        Run Grant AI
      </GrantAIButton>

      {result && (
        <div className="border p-3 rounded bg-gray-50 whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
}
