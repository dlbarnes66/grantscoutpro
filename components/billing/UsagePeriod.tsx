export function UsagePeriod({ period }: { period: any }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="text-xs text-slate-400">Billing Period</div>
      <div className="text-sm text-slate-300">
        {new Date(period.start * 1000).toLocaleDateString()} →{" "}
        {new Date(period.end * 1000).toLocaleDateString()}
      </div>
    </div>
  );
}
