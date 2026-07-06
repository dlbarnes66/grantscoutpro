export function ComplianceStatus({ compliance }: { compliance: any }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Compliance Status
      </h2>

      {compliance.passed ? (
        <div className="text-green-400 text-sm font-medium">
          ✔ All compliance requirements met
        </div>
      ) : (
        <div className="space-y-2 text-sm text-red-400">
          <div className="font-semibold">Issues Found:</div>
          {compliance.issues.map((issue: string, i: number) => (
            <div key={i}>• {issue}</div>
          ))}
        </div>
      )}

      <button className="rounded-md bg-slate-800 hover:bg-slate-700 transition px-3 py-2 text-sm font-medium">
        Run AI Compliance Check
      </button>
    </div>
  );
}
