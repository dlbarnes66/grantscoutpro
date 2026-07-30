"use client";

export function GrantEligibility({ grant }: { grant: any }) {
  const fields = [
    { label: "Industry", value: grant.industry },
    { label: "Location", value: grant.location },
    { label: "Eligible States", value: grant.eligibleStates },
    { label: "Geographic Focus", value: grant.geographicFocus },
    { label: "Eligible Applicants", value: grant.eligibleApplicants },
    { label: "Ineligible Applicants", value: grant.ineligibleApplicants },
  ];

  const hasEligibilityJson =
    grant.eligibility && typeof grant.eligibility === "object";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
      <h2 className="text-lg font-semibold">Eligibility</h2>

      <div className="space-y-2">
        {fields.map((f) => (
          <div key={f.label}>
            <p className="text-xs text-gray-500">{f.label}</p>
            <p className="text-sm text-gray-800">{f.value ?? "—"}</p>
          </div>
        ))}
      </div>

      {hasEligibilityJson && (
        <div className="mt-4">
          <p className="text-xs text-gray-500">Eligibility Details (JSON)</p>
          <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-auto">
            {JSON.stringify(grant.eligibility, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
