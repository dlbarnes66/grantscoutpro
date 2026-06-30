export function UsageSummary({ summary }: { summary: any }) {
  const cards = [
    { label: "AI Tokens Used", value: summary.ai_tokens },
    { label: "Grant Searches", value: summary.grant_searches },
    { label: "Active Seats", value: summary.seats },
    { label: "Total Usage Cost", value: `$${summary.cost.toFixed(2)}` }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-slate-800 bg-slate-900 p-6"
        >
          <div className="text-xs text-slate-400">{c.label}</div>
          <div className="text-xl font-semibold text-slate-100">
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}
