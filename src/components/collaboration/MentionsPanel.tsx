"use client"

import React from "react";

export function MentionsPanel({
  mentions = [],
}: {
  mentions?: Array<{ id: string; user: string; context: string }>;
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Mentions</h3>

      {mentions.map((m) => (
        <div key={m.id} className="border p-3 rounded bg-gray-50">
          <p className="font-medium">@{m.user}</p>
          <p className="text-sm text-gray-600">{m.context}</p>
        </div>
      ))}
    </div>
  );
}
