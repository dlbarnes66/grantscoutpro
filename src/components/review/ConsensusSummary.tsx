"use client"

import React from "react";

export default function ConsensusSummary({
  summary = "",
}: {
  summary?: string;
}) {
  return (
    <div className="border p-4 rounded bg-gray-50 space-y-2">
      <h3 className="font-semibold text-lg">Consensus Summary</h3>
      <p className="text-sm">{summary || "No consensus summary available."}</p>
    </div>
  );
}
