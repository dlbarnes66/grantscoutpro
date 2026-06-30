export function FinancialReconciliation({ financials }: { financials: any[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Financial Reconciliation
      </h2>

      <ul className="space-y-3 text-sm text-slate-300">
        {financials.map((item) => {
          const diff = item.spent - item.allocated;
          const color =
            diff > 0 ? "text-red-400" :
            diff < 0 ? "text-green-400" :
            "text-slate-300";

          return (
            <li key={item.id} className="flex items-center justify-between">
              <span>{item.category}</span>
              <span className="text-slate-400">
                Allocated: ${item.allocated.toLocaleString()}
              </span>
              <span className="text-slate-400">
                Spent: ${item.spent.toLocaleString()}
              </span>
              <span className={`font-semibold ${color}`}>
                {diff > 0 ? `Over by `\(⁠{diff}` : diff < 0 ? `Under by\)`{Math.abs(diff)}` : "Balanced"}
              </span>
            </li>
          );
        })}
      </ul>

      <button className="rounded-md bg-slate-800 hover:bg-slate-700 transition px-3 py-2 text-sm font-medium">
        Export Financial Summary
      </button>
    </div>
  );
}
