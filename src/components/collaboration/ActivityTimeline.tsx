"use client"

import React from "react";

export function ActivityTimeline({
  events = [],
}: {
  events?: Array<{ id: string; action: string; timestamp: string }>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Activity Timeline</h3>

      {events.map((e) => (
        <div key={e.id} className="border p-3 rounded">
          <p className="font-medium">{e.action}</p>
          <p className="text-sm text-gray-600">{e.timestamp}</p>
        </div>
      ))}
    </div>
  );
}
