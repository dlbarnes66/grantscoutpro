export function RiskFixes({ fixes }: { fixes: string[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Recommended Fixes
      </h2>

      <ul className="space-y-2 text-sm text-slate-300">
        {fixes.map((fix, i) => (
          <li key={i}>• {fix}</li>
        ))}
      </ul>

      <button className="w-full rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium">
        Apply Fixes with AI
      </button>
    </div>
  );
}
