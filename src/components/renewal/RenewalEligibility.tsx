"use client"

import React from "react";

export default function RenewalEligibility({
  eligible = false,
  reason = "",
}: {
  eligible?: boolean;
  reason?: string;
}) {
  return (
    <div className="border p-4 rounded bg-gray-50 space-y-2">
      <h3 className="font-semibold text-lg">Renewal Eligibility</h3>
      <p className="text-xl font-bold">
        {eligible ? "Eligible" : "Not Eligible"}
      </p>
      {reason && <p className="text-sm text-gray-600">{reason}</p>}
    </div>
  );
}
