"use client";

import React from "react";

export function AIAnalysis({ grant }: { grant: any }) {
  if (!grant) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-500">No AI analysis available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold">AI Analysis</h2>

      {/* Summary */}
      <div>
        <h3 className="text-sm font-medium text-gray-700">Summary</h3>
        <p className="text-sm text-gray-600 mt-1">
          {grant.aiSummary ?? "No summary available."}
        </p>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-4">
        <Score label="Eligibility" value={grant.aiEligibilityScore} />
        <Score label="Alignment" value={grant.aiAlignmentScore} />
        <Score label="Competitiveness" value={grant.aiCompetitivenessScore} />
        <Score label="Risk" value={grant.aiRiskScore} />
        <Score label="Readiness" value={grant.aiReadinessScore} />
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-sm font-medium text-gray-700">Recommendations</h3>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 space-y-1">
          {(grant.aiRecommendations ?? []).map((r: string, idx: number) => (
            <li key={idx}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-gray-100 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">
        {value ?? "—"}
      </p>
    </div>
  );
}
