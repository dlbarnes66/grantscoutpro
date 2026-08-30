"use client"

import { SparklesIcon } from "@heroicons/react/24/outline";

export function AIInsights({ grant }: { grant: any }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-blue-400" />
        <h2 className="text-sm font-semibold text-slate-100">
          AI Insights
        </h2>
      </div>

      <p className="text-sm text-slate-300">
        This grant strongly aligns with youth empowerment and community engagement.
        Your organization’s mission appears to be a good match.
      </p>

      <button className="w-full rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium">
        Generate Full AI Analysis
      </button>
    </div>
  );
}
