"use client";

import { useEffect, useState } from "react";

export default function GrantDetailPage({ params }: { params: { id: string } }) {
  const grantId = params.id;

  const [grant, setGrant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGrant() {
      try {
        const res = await fetch("/api/grants/detail", {
          method: "POST",
          body: JSON.stringify({
            grantId,
            tier: "ENTERPRISE",
            workspaceId: null,
          }),
        });

        const data = await res.json();

        if (data.error) {
          setError(data.error);
        } else {
          setGrant(data.grant);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    loadGrant();
  }, [grantId]);

  if (loading) {
    return <div className="p-6">Loading grant details…</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  if (!grant) {
    return <div className="p-6">Grant not found.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-semibold">{grant.title}</h1>
        <p className="text-sm text-gray-600">
          Source: {grant.source} • Tier: {grant.tierAccess}
        </p>
      </div>

      {/* Summary */}
      {grant.summary && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <p className="text-gray-700">{grant.summary}</p>
        </div>
      )}

      {/* Description */}
      {grant.description && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {grant.description}
          </p>
        </div>
      )}

      {/* Agency + Category */}
      <div className="grid grid-cols-2 gap-4">
        {grant.agency && (
          <div>
            <h3 className="font-semibold">Agency</h3>
            <p>{grant.agency}</p>
          </div>
        )}

        {grant.category && (
          <div>
            <h3 className="font-semibold">Category</h3>
            <p>{grant.category}</p>
          </div>
        )}
      </div>

      {/* Funding */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Funding</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold">Min Award</h3>
            <p>{grant.amountMin ?? "N/A"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Max Award</h3>
            <p>{grant.amountMax ?? "N/A"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Total Funding</h3>
            <p>{grant.totalFunding ?? "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Dates</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold">Deadline</h3>
            <p>
              {grant.deadline
                ? new Date(grant.deadline).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Posted</h3>
            <p>
              {grant.postedDate
                ? new Date(grant.postedDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Updated</h3>
            <p>
              {grant.updatedDate
                ? new Date(grant.updatedDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Eligibility */}
      {grant.eligibility && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Eligibility</h2>
          <pre className="text-gray-700 bg-gray-100 p-3 rounded">
            {JSON.stringify(grant.eligibility, null, 2)}
          </pre>
        </div>
      )}

      {/* Geographic */}
      <div className="grid grid-cols-2 gap-4">
        {grant.geographicFocus && (
          <div>
            <h3 className="font-semibold">Geographic Focus</h3>
            <p>{grant.geographicFocus}</p>
          </div>
        )}
        {grant.eligibleStates && (
          <div>
            <h3 className="font-semibold">Eligible States</h3>
            <p>{grant.eligibleStates}</p>
          </div>
        )}
      </div>

      {/* Foundation Fields */}
      {(grant.foundationName ||
        grant.foundationMission ||
        grant.foundationGivingAreas) && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Foundation Details</h2>

          {grant.foundationName && (
            <p>
              <strong>Name:</strong> {grant.foundationName}
            </p>
          )}

          {grant.foundationMission && (
            <p>
              <strong>Mission:</strong> {grant.foundationMission}
            </p>
          )}

          {grant.foundationGivingAreas && (
            <p>
              <strong>Giving Areas:</strong> {grant.foundationGivingAreas}
            </p>
          )}
        </div>
      )}

      {/* AI Section */}
      {grant.ai && (
        <div>
          <h2 className="text-xl font-semibold mb-2">AI Insights</h2>

          <div className="grid grid-cols-5 gap-4">
            <div>
              <h3 className="font-semibold">Eligibility</h3>
              <p>{grant.ai.eligibilityScore ?? "N/A"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Alignment</h3>
              <p>{grant.ai.alignmentScore ?? "N/A"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Competitiveness</h3>
              <p>{grant.ai.competitivenessScore ?? "N/A"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Risk</h3>
              <p>{grant.ai.riskScore ?? "N/A"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Readiness</h3>
              <p>{grant.ai.readinessScore ?? "N/A"}</p>
            </div>
          </div>

          {grant.ai.summary && (
            <div className="mt-4">
              <h3 className="font-semibold mb-1">AI Summary</h3>
              <p className="text-gray-700">{grant.ai.summary}</p>
            </div>
          )}

          {grant.ai.recommendations && (
            <div className="mt-4">
              <h3 className="font-semibold mb-1">AI Recommendations</h3>
              <pre className="bg-gray-100 p-3 rounded text-gray-700">
                {JSON.stringify(grant.ai.recommendations, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
