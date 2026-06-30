"use client";

import { useState } from "react";

export function BudgetOptimizer({
  items,
  onOptimize
}: {
  items: any[];
  onOptimize: (optimized: any[]) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function optimize() {
    setLoading(true);

    // Placeholder — real AI integration comes later
    await new Promise((r) => setTimeout(r, 800));

    const optimized = items.map((item) => ({
      ...item,
      amount: Math.round(item.amount * 0.95) // 5% efficiency savings
    }));

    onOptimize(optimized);
    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Optimization
      </h2>

      <p className="text-sm text-slate-400">
        Improve cost efficiency while maintaining program impact.
      </p>

      <button
        onClick={optimize}
        disabled={loading}
        className="w-full rounded-md bg-green-600 hover:bg-green-700 transition px-3 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Optimizing..." : "Optimize Budget"}
      </button>
    </div>
  );
}
