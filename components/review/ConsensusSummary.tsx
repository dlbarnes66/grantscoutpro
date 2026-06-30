export function ConsensusSummary({ consensus }: { consensus: any }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Consensus Summary
      </h2>

      <div className="text-3xl font-bold text-blue-400">
        {consensus.averageScore}%
      </div>

      <div className="space-y-2 text-sm text-slate-300">
        <div className="font-semibold text-slate-100">Strengths</div>
        {consensus.strengths.map((s: string, i: number) => (
          <div key={i}>• {s}</div>
        ))}

        <div className="font-semibold text-slate-100 pt-3">Weaknesses</div>
        {consensus.weaknesses.map((w: string, i: number) => (
          <div key={i}>• {w}</div>
        ))}
      </div>
    </div>
  );
}
