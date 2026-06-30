export function MatchScore({ score }: { score: number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center space-y-3">
      <div className="text-sm font-semibold text-slate-100">
        AI Match Score
      </div>

      <div className="text-5xl font-bold text-blue-400">
        {score}%
      </div>

      <p className="text-sm text-slate-400">
        Based on mission alignment, eligibility, and program fit.
      </p>
    </div>
  );
}
