import GrantIntelligenceBadges from "./GrantIntelligenceBadges";
import GrantScoreBreakdown from "./GrantScoreBreakdown";

export default function GrantCard({ grant }) {
  return (
    <div className="border rounded p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold">{grant.title}</h3>
      <p className="text-sm text-gray-600">{grant.agency}</p>

      <div className="mt-2 text-sm">
        <strong>Score:</strong> {grant.score}
      </div>

      <GrantIntelligenceBadges breakdown={grant.breakdown} />
      <GrantScoreBreakdown breakdown={grant.breakdown} />
    </div>
  );
}
