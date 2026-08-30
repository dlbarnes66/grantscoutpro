"use client"

import React from "react";

export default function ScoreMatrix({
  criteria = [],
}: {
  criteria?: Array<{ id: string; label: string; score: number }>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Score Matrix</h3>

      {criteria.map((c) => (
        <div key={c.id} className="border p-3 rounded bg-gray-50">
          <p className="font-medium">{c.label}</p>
          <p className="text-sm">Score: {c.score}</p>
        </div>
      ))}
    </div>
  );
}
