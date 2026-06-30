export function ReviewerCards({ reviewers }: { reviewers: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {reviewers.map((r) => (
        <div
          key={r.id}
          className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-2"
        >
          <div className="text-sm font-semibold text-slate-100">{r.name}</div>
          <div className="text-xs text-slate-400">{r.role}</div>
          <div className="text-sm text-blue-400 font-medium">
            Score: {r.score}%
          </div>
        </div>
      ))}
    </div>
  );
}
