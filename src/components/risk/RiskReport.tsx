"use client"

import React from "react";

export default function RiskReport({
  risks = [],
}: {
  risks?: Array<{ id: string; category: string; level: string; notes: string }>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Risk Report</h3>

      {risks.map((r) => (
        <div key={r.id} className="border p-4 rounded bg-gray-50">
          <p className="font-medium">{r.category}</p>
          <p className="text-sm">Level: {r.level}</p>
          <p className="text-sm text-gray-600 mt-2">{r.notes}</p>
        </div>
      ))}
    </div>
  );
}
