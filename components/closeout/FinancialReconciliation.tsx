"use client";

import { FinancialRecord } from "./types";

export function FinancialReconciliation({ financials }: { financials: FinancialRecord[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Financial Reconciliation
      </h2>

      {financials.map((item) => (
        <div key={item.id} className="text-slate-300 text-sm">
          {JSON.stringify(item)}
        </div>
      ))}
    </div>
  );
}
