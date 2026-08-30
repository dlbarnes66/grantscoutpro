"use client"

import React from "react";

export default function FundingLikelihood({
  score = 0,
}: {
  score?: number;
}) {
  const percentage = Math.min(100, Math.max(0, score));

  return (
    <div className="border p-4 rounded bg-gray-50 space-y-2">
      <h3 className="font-semibold text-lg">Funding Likelihood</h3>
      <p className="text-xl font-bold">{percentage}%</p>
      <p className="text-sm text-gray-600">
        Estimated probability of funding based on review scores.
      </p>
    </div>
  );
}
