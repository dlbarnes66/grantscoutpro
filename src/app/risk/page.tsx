"use client";

import { useState } from "react";
import RiskReport from "@/components/risk/RiskReport";

export default function RiskPage() {
  const [report, setReport] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  async function runRisk() {
    setLoading(true);

    try {
      const project = {
        title:
          "Community Youth STEM Program",
        location: "Alabama",
        population:
          "underserved youth",
        budget: 120000,
      };

      const grant = {
        title:
          "STEM Education Expansion Grant",
        location: "USA",
        population: "youth",
      };

      const res = await fetch(
        "/api/ai/risk",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            project,
            grant,
          }),
        }
      );

      const data =
        await res.json();

      setReport(
        data?.report ?? []
      );
    } catch (error) {
      console.error(
        "Risk analysis failed:",
        error
      );

      setReport([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        AI Risk & Compliance
        Analysis
      </h1>

      <button
        onClick={runRisk}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium transition hover:bg-blue-700"
      >
        Run Risk Analysis
      </button>

      {loading && (
        <div className="text-slate-400">
          Analyzing...
        </div>
      )}

      {report && (
        <RiskReport
          risks={report}
        />
      )}
    </div>
  );
}