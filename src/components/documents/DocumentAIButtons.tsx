"use client";

import { useDocumentAI } from "@/hooks/useDocumentAI";
import { useState } from "react";

export default function DocumentAIButtons({
  workspaceId,
  documentId,
  onAIResultAction,
}: {
  workspaceId: string;
  documentId: string;
  onAIResultAction: (text: string) => void;
}) {
  const { loading, error, runAiAction } = useDocumentAI(workspaceId, documentId);
  const [tone, setTone] = useState("professional");

  async function handle(mode: any, payload: any = {}) {
    const res = await runAiAction(mode, payload);
    if (res?.result) {
      onAIResultAction(res.result);
    }
  }

  return (
    <div className="space-y-4">
      {error && <div className="text-red-400 text-sm">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button onClick={() => handle("summarize")} disabled={loading !== null} className="btn btn-secondary">
          {loading === "summarize" ? "Summarizing..." : "Summarize"}
        </button>

        <button onClick={() => handle("rewrite")} disabled={loading !== null} className="btn btn-secondary">
          {loading === "rewrite" ? "Rewriting..." : "Rewrite"}
        </button>

        <button onClick={() => handle("extract")} disabled={loading !== null} className="btn btn-secondary">
          {loading === "extract" ? "Extracting..." : "Extract"}
        </button>

        <button onClick={() => handle("improve")} disabled={loading !== null} className="btn btn-secondary">
          {loading === "improve" ? "Improving..." : "Improve"}
        </button>

        <button onClick={() => handle("tone", { tone })} disabled={loading !== null} className="btn btn-secondary">
          {loading === "tone" ? "Adjusting..." : "Tone Shift"}
        </button>

        <button onClick={() => handle("compliance")} disabled={loading !== null} className="btn btn-secondary">
          {loading === "compliance" ? "Checking..." : "Compliance Check"}
        </button>

        <button onClick={() => handle("reviewer_simulation")} disabled={loading !== null} className="btn btn-secondary">
          {loading === "reviewer_simulation" ? "Simulating..." : "Reviewer Simulation"}
        </button>

        <button onClick={() => handle("score")} disabled={loading !== null} className="btn btn-secondary">
          {loading === "score" ? "Scoring..." : "Score"}
        </button>

        <button onClick={() => handle("risk")} disabled={loading !== null} className="btn btn-secondary">
          {loading === "risk" ? "Analyzing..." : "Risk Analysis"}
        </button>

        <button onClick={() => handle("fit")} disabled={loading !== null} className="btn btn-secondary">
          {loading === "fit" ? "Evaluating..." : "Fit Assessment"}
        </button>

        <button onClick={() => handle("enhance")} disabled={loading !== null} className="btn btn-secondary">
          {loading === "enhance" ? "Enhancing..." : "Enhance"}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-zinc-300">Tone:</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="input w-40"
        >
          <option value="professional">Professional</option>
          <option value="optimistic">Optimistic</option>
          <option value="formal">Formal</option>
          <option value="friendly">Friendly</option>
          <option value="grant_reviewer">Grant Reviewer Tone</option>
        </select>
      </div>
    </div>
  );
}
