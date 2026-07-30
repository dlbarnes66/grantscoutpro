"use client";

import { RenewalEligibilityData } from "./types";

export default function RenewalEligibility({
  eligibility
}: {
  eligibility: RenewalEligibilityData;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Renewal Eligibility
      </h2>

      {eligibility.eligible ? (
        <div className="text-green-400 text-sm font-medium">
          ✔ Eligible for Renewal
        </div>
      ) : (
        <div className="text-red-400 text-sm font-medium">
          ✘ Not Eligible for Renewal
        </div>
      )}

      <div className="space-y-2 text-sm text-slate-300">
        {eligibility.reasons.map((r, i) => (
          <div key={i}>• {r}</div>
        ))}

        {eligibility.issues.length > 0 && (
          <div className="text-red-400 pt-2">
            Issues:
            {eligibility.issues.map((issue, idx) => (
              <div key={idx}>• {issue}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
