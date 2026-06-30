export function FitAnalysis({
  strengths,
  weaknesses
}: {
  strengths: string[];
  weaknesses: string[];
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
      <h2 className="text-sm font-semibold text-slate-100">
        Fit Analysis
      </h2>

      <div>
        <div className="text-xs text-green-400 font-semibold mb-2">
          Strengths
        </div>
        <ul className="space-y-2 text-sm text-slate-300">
          {strengths.map((s, i) => (
            <li key={i}>• {s}</li>
          ))}
        </ul>
      </div>

      <div>
        <div className="text-xs text-red-400 font-semibold mb-2">
          Weaknesses
        </div>
        <ul className="space-y-2 text-sm text-slate-300">
          {weaknesses.map((w, i) => (
            <li key={i}>• {w}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
