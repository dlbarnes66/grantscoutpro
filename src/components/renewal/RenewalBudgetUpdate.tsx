"use client"

import { RenewalBudgetItem } from "./types";

export default function RenewalBudgetUpdate({
  budget
}: {
  budget: RenewalBudgetItem[];
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Renewal Budget Updates
      </h2>

      <ul className="space-y-3 text-sm text-slate-300">
        {budget.map((item) => (
          <li key={item.id} className="flex items-center justify-between">
            <span>{item.category}</span>
            <span className="text-slate-400">
              Previous: ${item.previous.toLocaleString()}
            </span>
            <span className="text-blue-400 font-semibold">
              Updated: ${item.updated.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>

      <button className="rounded-md bg-slate-800 hover:bg-slate-700 transition px-3 py-2 text-sm font-medium">
        Edit Budget
      </button>
    </div>
  );
}
