"use client";

import { useEffect, useState } from "react";
import { AIAnalysis } from "./components/AIAnalysis";

export default function AIPage({ params }: any) {
  const { workspaceId, grantId } = params;

  const [analysis, setAnalysis] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch(`/api/grant/${grantId}/ai`);
      if (!res.ok) throw new Error("Failed to load AI analysis");
      const data = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function runAI() {
    try {
      setRunning(true);
      const res = await fetch(`/api/grant/${grantId}/ai/run`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("AI run failed");
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    load();
  }, [grantId]);

  if (loading) {
    return <div className="p-6 text-slate-300">Loading AI analysis…</div>;
  }

  if (error) {
    return <div className="p-6 text-red-400">{error}</div>;
  }

  return (
    <div className="p-6 space-y-10">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">AI Grant Analysis</h1>

        <button
          onClick={runAI}
          disabled={running}
          className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
        >
          {running ? "Running AI…" : "Run AI Analysis"}
        </button>
      </div>

      {/* MAIN ANALYSIS COMPONENT */}
      <AIAnalysis analysis={analysis} grantId={grantId} />

      {/* HISTORY LINK */}
      <a
        href={`/dashboard/${workspaceId}/grant/${grantId}/ai/history`}
        className="block rounded border border-slate-800 bg-slate-900/60 p-4 hover:bg-slate-800 transition text-slate-100"
      >
        View AI History →
      </a>
    </div>
  );
}
