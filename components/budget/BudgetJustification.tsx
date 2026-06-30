"use client";

export function BudgetJustification({ items }: { items: any[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Budget Justification
      </h2>

      <ul className="space-y-3 text-sm text-slate-300">
        {items.map((item) => (
          <li key={item.id}>
            <span className="font-semibold text-slate-100">{item.category}:</span>{" "}
            {item.description} — ${item.amount.toLocaleString()}
          </li>
        ))}
      </ul>

      <button className="rounded-md bg-slate-800 hover:bg-slate-700 transition px-3 py-2 text-sm font-medium">
        Export Justification
      </button>
    </div>
  );
}
