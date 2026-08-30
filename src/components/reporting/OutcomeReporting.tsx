"use client"

import React from "react";

export default function OutcomeReporting({
  outcomes = [],
}: {
  outcomes?: Array<{ id: string; description: string; achieved: boolean }>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Outcome Reporting</h3>

      {outcomes.map((o) => (
        <div key={o.id} className="border p-4 rounded bg-gray-50">
          <p className="font-medium">{o.description}</p>
          <p className="text-sm text-gray-600">
            Status: {o.achieved ? "Achieved" : "Not Achieved"}
          </p>
        </div>
      ))}
    </div>
  );
}
