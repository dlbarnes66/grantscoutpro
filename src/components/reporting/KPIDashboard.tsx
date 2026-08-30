"use client"

import React from "react";

export default function KPIDashboard({
  metrics = [],
}: {
  metrics?: Array<{ id: string; label: string; value: number }>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Key Performance Indicators</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.id} className="border p-4 rounded bg-gray-50">
            <p className="font-medium">{m.label}</p>
            <p className="text-2xl font-bold">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
