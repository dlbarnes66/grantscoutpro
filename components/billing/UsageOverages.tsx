export function UsageOverages({ overages }: { overages: any }) {
  if (!overages || overages.total === 0)
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
        No overages this period.
      </div>
    );

  return (
    <div className="rounded-xl border border-red-800 bg-red-900 p-6 text-red-200">
      <h2 className="text-sm font-semibold mb-2">Overages</h2>
      <div>Total Overages: ${overages.total.toFixed(2)}</div>

      <ul className="mt-3 space-y-2 text-sm">
        {overages.items.map((o: any) => (
          <li key={o.category}>
            {o.category}: ${o.cost.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}
