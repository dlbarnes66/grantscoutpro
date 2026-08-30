"use client"

import React from "react";

export default function ComplianceStatus({
  items = [],
}: {
  items?: Array<{ id: string; label: string; compliant: boolean }>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Compliance Status</h3>

      {items.map((i) => (
        <div key={i.id} className="border p-3 rounded bg-gray-50">
          <p className="font-medium">{i.label}</p>
          <p className="text-sm text-gray-600">
            {i.compliant ? "Compliant" : "Non‑Compliant"}
          </p>
        </div>
      ))}
    </div>
  );
}
