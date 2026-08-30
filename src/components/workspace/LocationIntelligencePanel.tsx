"use client"

import { useLocationIntelligence } from "@/hooks/useLocationIntelligence";

export default function LocationIntelligencePanel({ workspaceLocationId }) {
  const { intelligence, loading, refresh } =
    useLocationIntelligence(workspaceLocationId);

  if (loading) return <div>Loading intelligence…</div>;

  return (
    <div className="border rounded p-4 bg-gray-50 space-y-4">
      <h3 className="text-lg font-semibold">Location Intelligence</h3>

      {!intelligence && (
        <button
          onClick={() => refresh()}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Generate Intelligence
        </button>
      )}

      {intelligence && (
        <>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Population:</strong> {intelligence.population ?? "N/A"}
            </div>
            <div>
              <strong>Median Income:</strong> $
              {intelligence.medianIncome ?? "N/A"}
            </div>
            <div>
              <strong>Poverty Rate:</strong>{" "}
              {intelligence.povertyRate
                ? `${intelligence.povertyRate}%`
                : "N/A"}
            </div>
            <div>
              <strong>Unemployment:</strong>{" "}
              {intelligence.unemploymentRate
                ? `${intelligence.unemploymentRate}%`
                : "N/A"}
            </div>
            <div>
              <strong>Rural/Urban Code:</strong>{" "}
              {intelligence.ruralUrbanCode ?? "N/A"}
            </div>
            <div>
              <strong>Opportunity Zone:</strong>{" "}
              {intelligence.opportunityZone ? "Yes" : "No"}
            </div>
            <div>
              <strong>Distressed Community:</strong>{" "}
              {intelligence.distressedCommunity ? "Yes" : "No"}
            </div>
          </div>

          <button
            onClick={() => refresh()}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Refresh Intelligence
          </button>
        </>
      )}
    </div>
  );
}
