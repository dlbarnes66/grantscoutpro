"use client"

import React from "react";

export default function APIRateLimits({
  limits = { perMinute: 60, perHour: 500, perDay: 5000 },
}: {
  limits?: { perMinute: number; perHour: number; perDay: number };
}) {
  return (
    <div className="border p-4 rounded bg-gray-50 space-y-3">
      <h3 className="font-semibold text-lg">API Rate Limits</h3>

      <p>Per Minute: {limits.perMinute}</p>
      <p>Per Hour: {limits.perHour}</p>
      <p>Per Day: {limits.perDay}</p>
    </div>
  );
}
