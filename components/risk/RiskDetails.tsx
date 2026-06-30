export function RiskDetails({ details }: { details: any }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
      <h2 className="text-sm font-semibold text-slate-100">
        Detailed Risk Breakdown
      </h2>

      {Object.entries(details).map(([category, items]) => (
        <div key={category} className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase">
            {category}
          </div>

          <ul className="space-y-1 text-sm text-slate-300">
            {(items as string[]).map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
