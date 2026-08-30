"use client"

import React from "react";

export default function MilestoneTracker({
  milestones = [],
}: {
  milestones?: Array<{ id: string; name: string; completed: boolean }>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Milestone Tracker</h3>

      {milestones.map((m) => (
        <div key={m.id} className="border p-3 rounded bg-gray-50 flex items-center gap-3">
          <input type="checkbox" checked={m.completed} readOnly />
          <span className={m.completed ? "line-through text-gray-500" : ""}>
            {m.name}
          </span>
        </div>
      ))}
    </div>
  );
}
