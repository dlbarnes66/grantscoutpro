"use client";

import { SparklesIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { OutcomeItem } from "./types";

export default function AIReportGenerator({
  outcomes
}: {
  outcomes: OutcomeItem[];
}) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState("");

  async function generate() {
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    setReport(
      "This is an AI-generated outcome report summarizing program achievements, impact metrics, and evidence of success."
    );

    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-blue-400" />
        <h2 className="text-sm font-semibold text-slate-100">
          AI Outcome Report
        </h2>
      </div>

      <p className="text-sm text-slate-400">
        Generate a full narrative report based on your outcomes.
      </p>

      <button
        onClick={generate}
        disabled={loading}
        className="w-full rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Report"}
      </button>

      {report && (
        <div className="rounded-lg bg-slate-800 p-4 text-sm text-slate-300">
          {report}
        </div>
      )}
    </div>
  );
}
