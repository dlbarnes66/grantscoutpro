export function ScoreMatrix({ criteria }: { criteria: any[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Score Matrix
      </h2>

      <div className="space-y-4">
        {criteria.map((c) => (
          <div key={c.id} className="space-y-2">
            <div className="text-sm text-slate-300">{c.label}</div>

            <div className="flex gap-2">
              {c.scores.map((score: number, i: number) => (
                <div
                  key={i}
                  className="rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-100"
                >
                  {score}/5
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
