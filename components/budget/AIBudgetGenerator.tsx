"use client";

import { SparklesIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export function AIBudgetGenerator({
  onGenerate
}: {
  onGenerate: (items: any[]) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);

    // Placeholder — real AI integration comes later
    await new Promise((r) => setTimeout(r, 800));

    onGenerate([
      { id: crypto.randomUUID(), category: "Personnel", description: "Program Director", amount: 60000 },
      { id: crypto.randomUUID(), category: "Supplies", description: "Training materials", amount: 8000 },
      { id: crypto.randomUUID(), category: "Travel", description: "Community outreach travel", amount: 5000 }
    ]);

    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-blue-400" />
        <h2 className="text-sm font-semibold text-slate-100">
          AI Budget Generator
        </h2>
      </div>

      <p className="text-sm text-slate-400">
        Generate a complete budget based on your project details.
      </p>

      <button
        onClick={generate}
        disabled={loading}
        className="w-full rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Budget"}
      </button>
    </div>
  );
}
