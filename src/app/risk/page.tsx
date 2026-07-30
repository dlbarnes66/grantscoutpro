"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useState } from "react";
import RiskReport from "@/components/risk/RiskReport";

export default function RiskPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function runRisk() {
    setLoading(true);

    const project = {
      title: "Community Youth STEM Program",
      location: "Alabama",
      population: "underserved youth",
      budget: 120000
    };

    const grant = {
      title: "STEM Education Expansion Grant",
      location: "USA",
      population: "youth"
    };

    const res = await fetch("/api/ai/risk", {
      method: "POST",
      body: JSON.stringify({ project, grant })
    });

    const data = await res.json();
    setReport(data.report);

    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        AI Risk & Compliance Analysis
      </h1>

      <button
        onClick={runRisk}
        className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-4 py-2 text-sm font-medium"
      >
        Run Risk Analysis
      </button>

      {loading && <div className="text-slate-400">Analyzing...</div>}

      {report && <RiskReport report={report} />}
    </div>
  );
}
