export default function GrantIntelligenceBadges({ breakdown }) {
  if (!breakdown) return null;

  const intel = breakdown.intelligence;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {intel.poverty > 0 && (
        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
          High-Poverty Area
        </span>
      )}

      {intel.income > 0 && (
        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
          Low-Income Match
        </span>
      )}

      {intel.unemployment > 0 && (
        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">
          High Unemployment
        </span>
      )}

      {intel.ruralUrban > 0 && (
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
          Rural/Urban Match
        </span>
      )}

      {intel.opportunityZone > 0 && (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
          Opportunity Zone
        </span>
      )}

      {intel.distressed > 0 && (
        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
          Distressed Community
        </span>
      )}
    </div>
  );
}
