"use client"

import React from "react";

export function TeamMembers({
  members = [],
}: {
  members?: Array<{ id: string; name: string; role: string }>;
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Team Members</h3>

      {members.map((m) => (
        <div key={m.id} className="border p-3 rounded bg-gray-50">
          <p className="font-medium">{m.name}</p>
          <p className="text-sm text-gray-600">Role: {m.role}</p>
        </div>
      ))}
    </div>
  );
}
