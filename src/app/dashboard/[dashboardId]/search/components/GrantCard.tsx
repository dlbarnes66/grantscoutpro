export function GrantCard({ grant }: { grant: any }) {
  return (
    <div className="border rounded p-4 shadow-sm">
      <h3 className="text-lg font-semibold">{grant.title}</h3>

      {grant.summary && (
        <p className="text-gray-600 mt-1">{grant.summary}</p>
      )}

      <div className="mt-3 text-sm text-gray-700">
        {grant.agency && <p>Agency: {grant.agency}</p>}
        {grant.category && <p>Category: {grant.category}</p>}
        {grant.deadline && (
          <p>Deadline: {new Date(grant.deadline).toLocaleDateString()}</p>
        )}
      </div>

      <div className="mt-3 text-sm">
        <p className="font-medium">AI Scores:</p>
        <ul className="ml-4 list-disc">
          <li>Eligibility: {grant.aiEligibilityScore ?? "N/A"}</li>
          <li>Alignment: {grant.aiAlignmentScore ?? "N/A"}</li>
          <li>Competitiveness: {grant.aiCompetitivenessScore ?? "N/A"}</li>
          <li>Risk: {grant.aiRiskScore ?? "N/A"}</li>
          <li>Readiness: {grant.aiReadinessScore ?? "N/A"}</li>
        </ul>
      </div>
    </div>
  );
}
