export function BudgetTotals({ items }: { items: any[] }) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
      <h2 className="text-sm font-semibold text-slate-100">
        Total Budget
      </h2>

      <div className="text-3xl font-bold text-blue-400">
        ${total.toLocaleString()}
      </div>

      <p className="text-xs text-slate-400">
        Automatically updates as you edit line items.
      </p>
    </div>
  );
}
