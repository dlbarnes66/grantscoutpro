export function RecommendedActions({ actions }: { actions: string[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Recommended Actions
      </h2>

      <ul className="space-y-2 text-sm text-slate-300">
        {actions.map((a, i) => (
          <li key={i}>• {a}</li>
        ))}
      </ul>

      <button className="w-full rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium">
        Run Full AI Match Analysis
      </button>
    </div>
  );
}
