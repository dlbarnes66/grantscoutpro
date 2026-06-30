export function FormattingChecks({ formatting }: { formatting: any }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Formatting & Compliance Checks
      </h2>

      {formatting.passed ? (
        <div className="text-green-400 text-sm font-medium">
          ✔ All formatting checks passed
        </div>
      ) : (
        <div className="space-y-2 text-sm text-red-400">
          <div className="font-semibold">Issues Found:</div>
          {formatting.issues.map((issue: string, i: number) => (
            <div key={i}>• {issue}</div>
          ))}
        </div>
      )}

      <button className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium">
        Run AI Formatting Check
      </button>
    </div>
  );
}
