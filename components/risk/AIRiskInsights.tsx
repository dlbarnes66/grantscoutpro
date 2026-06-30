"use client";

import { SparklesIcon } from "@heroicons/react/24/outline";

export function AIRiskInsights({ insights }: { insights: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-blue-400" />
        <h2 className="text-sm font-semibold text-slate-100">
          AI Risk Insights
        </h2>
      </div>

      <p className="text-sm text-slate-300">
        {insights}
      </p>

      <button className="w-full rounded-md bg-slate-800 hover:bg-slate-700 transition px-3 py-2 text-sm font-medium">
        Generate Full AI Risk Report
      </button>
    </div>
  );
}
