export function EligibilityPreview({ eligibility }: { eligibility: any }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Eligibility Preview
      </h2>

      {eligibility.eligible ? (
        <div className="text-sm text-green-400 font-medium">
          ✔ Eligible
        </div>
      ) : (
        <div className="text-sm text-red-400 font-medium">
          ✘ Not Eligible
        </div>
      )}

      <div className="space-y-2 text-sm text-slate-300">
        {eligibility.reasons.map((r: string, i: number) => (
          <div key={i}>• {r}</div>
        ))}

        {eligibility.issues.length > 0 && (
          <div className="text-red-400 pt-2">
            Issues:
            {eligibility.issues.map((i: string, idx: number) => (
              <div key={idx}>• {i}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
