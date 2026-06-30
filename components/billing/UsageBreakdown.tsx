export function UsageBreakdown({ items }: { items: any[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-sm font-semibold text-slate-100 mb-4">
        Usage Breakdown
      </h2>

      <table className="w-full text-sm text-slate-300">
        <thead>
          <tr className="text-slate-400">
            <th className="text-left py-2">Category</th>
            <th className="text-left py-2">Quantity</th>
            <th className="text-left py-2">Cost</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.category} className="border-t border-slate-800">
              <td className="py-2">{item.category}</td>
              <td className="py-2">{item.quantity}</td>
              <td className="py-2">${item.cost.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
