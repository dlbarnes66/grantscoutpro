"use client"

import React from "react";

export default function ReviewerCards({
  reviewers = [],
}: {
  reviewers?: Array<{ id: string; name: string; expertise: string }>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Reviewers</h3>

      {reviewers.map((r) => (
        <div key={r.id} className="border p-4 rounded bg-gray-50">
          <p className="font-medium">{r.name}</p>
          <p className="text-sm text-gray-600">Expertise: {r.expertise}</p>
        </div>
      ))}
    </div>
  );
}
