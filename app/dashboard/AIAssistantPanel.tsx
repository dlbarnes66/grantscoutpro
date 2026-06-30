"use client";

import { SparklesIcon } from "@heroicons/react/24/outline";

export function AIAssistantPanel() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-blue-400" />
        <h2 className="text-sm font-semibold text-slate-100">
          AI Assistant
        </h2>
      </div>

      <p className="text-sm text-slate-400">
        Ask anything about grants, narratives, budgets, compliance, or strategy.
      </p>

      <textarea
        placeholder="Ask GrantScout Pro anything..."
        className="w-full h-24 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
      />

      <button className="w-full rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium">
        Ask AI
      </button>
    </div>
  );
}
