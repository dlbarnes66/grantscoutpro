"use client";

export function GrantFunding({ grant }: { grant: any }) {
  const fields = [
    { label: "Amount", value: grant.amount },
    { label: "Min Award", value: grant.amountMin },
    { label: "Max Award", value: grant.amountMax },
    { label: "Total Funding", value: grant.totalFunding },
    { label: "Award Floor", value: grant.awardFloor },
    { label: "Award Ceiling", value: grant.awardCeiling },
    { label: "Expected Awards", value: grant.expectedAwards },
  ];

  const hasFinancialDetails =
    grant.totalFunding ||
    grant.awardFloor ||
    grant.awardCeiling ||
    grant.expectedAwards;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
      <h2 className="text-lg font-semibold">Funding</h2>

      <div className="grid grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.label}>
            <p className="text-xs text-gray-500">{f.label}</p>
            <p className="text-sm font-medium text-gray-800">
              {f.value ?? "—"}
            </p>
          </div>
        ))}
      </div>

      {hasFinancialDetails && (
        <div className="mt-4">
          <p className="text-xs text-gray-500">Funding Details</p>
          <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-auto">
            {JSON.stringify(
              {
                totalFunding: grant.totalFunding,
                awardFloor: grant.awardFloor,
                awardCeiling: grant.awardCeiling,
                expectedAwards: grant.expectedAwards,
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
