"use client"

import React from "react";

export default function MatchResults({
  results = [],
}: {
  results?: Array<{ id: string; title: string; score: number }>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Match Results</h3>

      {results.map((r) => (
        <div key={r.id} className="border p-4 rounded bg-gray-50">
          <p className="font-medium">{r.title}</p>
          <p className="text-sm text-gray-600">Score: {r.score}</p>
        </div>
      ))}
    </div>
  );
}
