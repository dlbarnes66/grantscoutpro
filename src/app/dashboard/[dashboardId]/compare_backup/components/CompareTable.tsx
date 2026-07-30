export function CompareTable({ grants }: { grants: any[] }) {
  if (grants.length === 0) {
    return <p className="p-6 text-gray-500">No grants added for comparison.</p>;
  }

  return (
    <div className="overflow-auto p-6">
      <table className="min-w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-3">Field</th>
            {grants.map((g) => (
              <th key={g.id} className="border p-3">
                <div className="flex justify-between items-center">
                  <span>{g.title}</span>
                  <button
                    onClick={async () => {
                      await fetch(`/api/compare/remove/${g.workspaceId}`, {
                        method: "POST",
                        body: JSON.stringify({ grantId: g.id }),
                      });
                      location.reload();
                    }}
                    className="text-red-600 ml-2"
                  >
                    ✕
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="border p-3 font-medium">Agency</td>
            {grants.map((g) => (
              <td key={g.id} className="border p-3">{g.agency ?? "—"}</td>
            ))}
          </tr>

          <tr>
            <td className="border p-3 font-medium">Category</td>
            {grants.map((g) => (
              <td key={g.id} className="border p-3">{g.category ?? "—"}</td>
            ))}
          </tr>

          <tr>
            <td className="border p-3 font-medium">Deadline</td>
            {grants.map((g) => (
              <td key={g.id} className="border p-3">
                {g.deadline ? new Date(g.deadline).toLocaleDateString() : "—"}
              </td>
            ))}
          </tr>

          <tr>
            <td className="border p-3 font-medium">Amount</td>
            {grants.map((g) => (
              <td key={g.id} className="border p-3">
                {g.amount ?? g.amountMax ?? g.amountMin ?? "—"}
              </td>
            ))}
          </tr>

          <tr>
            <td className="border p-3 font-medium">AI Eligibility</td>
            {grants.map((g) => (
              <td key={g.id} className="border p-3">
                {g.aiEligibilityScore ?? "—"}
              </td>
            ))}
          </tr>

          <tr>
            <td className="border p-3 font-medium">AI Alignment</td>
            {grants.map((g) => (
              <td key={g.id} className="border p-3">
                {g.aiAlignmentScore ?? "—"}
              </td>
            ))}
          </tr>

          <tr>
            <td className="border p-3 font-medium">AI Competitiveness</td>
            {grants.map((g) => (
              <td key={g.id} className="border p-3">
                {g.aiCompetitivenessScore ?? "—"}
              </td>
            ))}
          </tr>

          <tr>
            <td className="border p-3 font-medium">AI Risk</td>
            {grants.map((g) => (
              <td key={g.id} className="border p-3">
                {g.aiRiskScore ?? "—"}
              </td>
            ))}
          </tr>

          <tr>
            <td className="border p-3 font-medium">AI Readiness</td>
            {grants.map((g) => (
              <td key={g.id} className="border p-3">
                {g.aiReadinessScore ?? "—"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
