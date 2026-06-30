export function FundingLikelihood({ likelihood }: { likelihood: number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
      <h2 className="text-sm font-semibold text-slate-100">
        Funding Likelihood
      </h2>

      <div className="text-4xl font-bold text-green-400">
        {likelihood}%
      </div>

      <p className="text-xs text-slate-400">
        Based on reviewer scores, alignment, and compliance.
      </p>
    </div>
  );
}
