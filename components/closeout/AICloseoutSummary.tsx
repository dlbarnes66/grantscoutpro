"use client";

import { SparklesIcon } from "@heroicons/react/24/outline";

export function AICloseoutSummary({ insights }: { insights: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-blue-400" />
        <h2 className="text-sm font-semibold text-slate-100">
          AI Closeout Summary
        </h2>
      </div>

      <p className="text-sm text-slate-300">{insights}</p>

      <button className="w-full rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium">
        Generate Full AI Closeout Report
      </button>
    </div>
  );
}
