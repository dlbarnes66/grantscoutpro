"use client";

export function FinancialReconciliation({ financials }: { financials: any[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Financial Reconciliation
      </h2>

      {financials.map((item, idx) => (
        <div key={idx} className="text-slate-300 text-sm">
          {JSON.stringify(item)}
        </div>
      ))}
    </div>
  );
}
